import { TokenGenerator, TokenRepository, Token, TokenManager, StoredToken, AssociatedValueToToken } from '../../api';
import {
  GenerateTokenError,
  AlreadyUsedTokenError,
  ExpiredTokenError,
  StoreTokenIntoStorageError,
  InvalidTokenError
} from '../../api/exception/TokenError';
import { ExpirableToken } from './ExpirableTokenGenerator';

export enum TokenState {
  UNUSED = 'UNUSED',
  ALREADY_USED = 'ALREADY_USED'
}

export class TokenWithState implements Token {
  /**
   * @param original The original token that has been generated
   * @param state The state to associate with the token
   */
  constructor(public original: Token, public state: TokenState) {}

  get value() {
    return this.original.value;
  }
}

/**
 * Generate or validate tokens
 */
export class TokenManagerImpl implements TokenManager {
  constructor(private tokenGenerator: TokenGenerator, private tokenStorage: TokenRepository) {}

  /**
   * Validate the token in the specified storage
   * @param token Token to validate
   * @param matcher A function used to compare stored value with something
   */
  async validate(
    token: Token,
    matcher?: (associatedValue?: AssociatedValueToToken) => Promise<boolean>
  ): Promise<StoredToken> {
    // Get the token from the database
    const tokenFromStorage = await this.tokenStorage.getFromToken(token);
    const storedToken = tokenFromStorage.token as TokenWithState;

    // Check the validation
    if (storedToken.state === TokenState.ALREADY_USED) {
      throw new AlreadyUsedTokenError(`This token was already used`, token);
    }

    // Check that token is not expired
    if (storedToken.original instanceof ExpirableToken) {
      if (storedToken.original.expires < new Date().getTime()) {
        throw new ExpiredTokenError(`This token is expired`, token);
      }
    }

    // Check that associated value matches the token
    if (matcher) {
      if (!(await matcher(tokenFromStorage.associatedValue))) {
        throw new InvalidTokenError(`This token is invalid`, token);
      }
    }

    // At this point, the token is valid
    try {
      storedToken.state = TokenState.ALREADY_USED;
      await this.tokenStorage.store(storedToken, tokenFromStorage.associatedValue);
    } catch (e) {
      throw new StoreTokenIntoStorageError('Failed to store token', tokenFromStorage.token, e);
    }

    return tokenFromStorage;
  }

  async generate(): Promise<Token> {
    try {
      const token = await this.tokenGenerator.generate();
      return token;
    } catch (e) {
      throw new GenerateTokenError(`Failed to generate the token`, e);
    }
  }

  async save(token: Token, associatedValue?: AssociatedValueToToken): Promise<Token> {
    try {
      return await this.tokenStorage.store(token, associatedValue);
    } catch (e) {
      throw new StoreTokenIntoStorageError(
        `Failed to store the token in the storage with the associated value`,
        token,
        e
      );
    }
  }
}
