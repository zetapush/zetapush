import {
  TokenGenerator,
  TokenStorageManager,
  Token,
  TokenManager,
  ExpirableToken,
  StateToken,
  StoredToken,
  AssociatedValueToToken
} from '../../api';
import {
  GenerateTokenError,
  AlreadyUsedTokenError,
  ExpiredTokenError,
  StoreTokenIntoStorageError
} from '../../api/exception/TokenError';

/**
 * Generate or validate tokens
 */
export class TokenManagerImpl implements TokenManager {
  constructor(private tokenGenerator: TokenGenerator, private tokenStorage: TokenStorageManager) {}

  /**
   * Validate the token in the specified storage
   * @param token Token to validate
   */
  validate(token: Token): Promise<StoredToken> {
    return new Promise<StoredToken>(async (resolve, reject) => {
      // Get the token from the database
      const tokenFromStorage = await this.tokenStorage.getFromToken(token);

      // Check the validation
      if (tokenFromStorage.state === StateToken.ALREADY_USED) {
        reject(new AlreadyUsedTokenError(`This token was already used`, token, this.tokenStorage));
      }

      if (tokenFromStorage instanceof ExpirableToken) {
        if (tokenFromStorage.expires < new Date().getTime()) {
          reject(new ExpiredTokenError(`This token is expired`, token, this.tokenStorage));
        }
      }

      // At this point, the token is valid
      tokenFromStorage.state = StateToken.ALREADY_USED;
      this.tokenStorage.store(tokenFromStorage);

      resolve(tokenFromStorage);
    });
  }

  generate(): Promise<Token> {
    return new Promise<Token>(async (resolve, reject) => {
      try {
        const token = await this.tokenGenerator.generate();
        resolve(token);
      } catch (e) {
        reject(new GenerateTokenError(`Failed to generate the token`, this.tokenGenerator));
      }
    });
  }

  save(token: Token, associatedValue?: AssociatedValueToToken): Promise<Token> {
    return new Promise<Token>(async (resolve, reject) => {
      try {
        await this.tokenStorage.store(token, associatedValue);
        resolve(token);
      } catch (e) {
        reject(
          new StoreTokenIntoStorageError(
            `Failed to store the token in the storage with the associated value`,
            token,
            this.tokenStorage
          )
        );
      }
    });
  }
}
