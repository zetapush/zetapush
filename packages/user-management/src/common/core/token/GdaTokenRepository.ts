import { Token, TokenRepository, StoredToken, TokenState, AssociatedValueToToken, BootstrapError } from '../../api';
import {
  GetTokenFromStorageError,
  DeleteTokenFromStorageError,
  StoreTokenIntoStorageError,
  TokenNotFoundError
} from '../../api/exception/TokenError';
import { Gda, GdaConfigurer, GdaDataType, Idempotence } from '@zetapush/platform-legacy';
import { Injectable } from '@zetapush/core';

export class TokenStorageInitError extends BootstrapError {}

@Injectable()
export class GdaTokenRepository implements TokenRepository {
  private STORAGE_TOKEN_NAME_TABLE = 'storagetokennametable';
  private STORAGE_TOKEN_NAME_COLUMN = 'storagetokennamecolumn';

  constructor(private gdaStorage: Gda, private gdaConfigurer: GdaConfigurer) {}

  async onApplicationBootstrap() {
    try {
      await this.gdaConfigurer.createTable({
        columns: [
          {
            name: this.STORAGE_TOKEN_NAME_COLUMN,
            type: GdaDataType.OBJECT
          }
        ],
        name: this.STORAGE_TOKEN_NAME_TABLE,
        idempotence: Idempotence.IGNORE_IDENTICAL
      });
    } catch (e) {
      throw new TokenStorageInitError(`Failed to create the table in the database to store the token`, e);
    }
  }

  async store(token: Token, associatedValue?: AssociatedValueToToken): Promise<Token> {
    const objToSave: StoredToken = {
      token,
      state: TokenState.UNUSED,
      associatedValue
    };

    try {
      await this.gdaStorage.put({
        column: this.STORAGE_TOKEN_NAME_COLUMN,
        table: this.STORAGE_TOKEN_NAME_TABLE,
        key: token.value,
        data: objToSave
      });
      return token;
    } catch (e) {
      throw new StoreTokenIntoStorageError(`The request to store the token in the storage has failed`, token, e);
    }
  }

  async delete(token: Token): Promise<Token> {
    try {
      await this.gdaStorage.removeRow({
        key: token.value,
        table: this.STORAGE_TOKEN_NAME_TABLE
      });
      return token;
    } catch (e) {
      throw new DeleteTokenFromStorageError(`The request to remove the token from the storage has failed`, token, e);
    }
  }

  async getFromToken(token: Token): Promise<StoredToken> {
    let outputStorage;
    try {
      outputStorage = await this.gdaStorage.get({
        key: token.value,
        table: this.STORAGE_TOKEN_NAME_TABLE
      });
    } catch (e) {
      throw new GetTokenFromStorageError(`The request to retrieve the token has failed`, token, e);
    }

    if (!outputStorage || !outputStorage.result) {
      throw new TokenNotFoundError(`No matching token found`, token);
    }
    return outputStorage.result[this.STORAGE_TOKEN_NAME_COLUMN];
  }
}
