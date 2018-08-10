import { Token, TokenStorageManager, StoredToken, StateToken, AssociatedValueToToken } from '../../api';
import {
  GetTokenFromStorageError,
  DeleteTokenFromStorageError,
  StoreTokenIntoStorageError,
  PrepareTokenStorageError
} from '../../api/exception/TokenError';
import { Gda, GdaConfigurer, GdaDataType, Idempotence } from '@zetapush/platform-legacy';
import { Injectable } from 'injection-js';

@Injectable()
export class DefaultStorageTokenManager implements TokenStorageManager {
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
      throw new PrepareTokenStorageError(`Failed to create the table in the database to store the token`, this);
    }
  }

  store(token: Token, associatedValue?: AssociatedValueToToken): Promise<Token> {
    return new Promise<Token>(async (resolve, reject) => {
      const objToSave = <StoredToken>{
        value: token.value,
        state: StateToken.UNUSED,
        associatedValue
      };

      try {
        await this.gdaStorage.put({
          column: this.STORAGE_TOKEN_NAME_COLUMN,
          table: this.STORAGE_TOKEN_NAME_TABLE,
          key: token.value,
          data: objToSave
        });
        resolve(token);
      } catch (e) {
        reject(
          new StoreTokenIntoStorageError(
            `The request to store the token in the storage has failed`,
            token,
            this,
            e.message
          )
        );
      }
    });
  }

  delete(token: Token): Promise<Token> {
    return new Promise<Token>(async (resolve, reject) => {
      try {
        await this.gdaStorage.removeRow({
          key: token.value,
          table: this.STORAGE_TOKEN_NAME_TABLE
        });
        resolve(token);
      } catch (e) {
        reject(
          new DeleteTokenFromStorageError(`The request to remove the token from the storage has failed`, token, this)
        );
      }
    });
  }

  getFromToken(token: Token): Promise<StoredToken> {
    return new Promise<StoredToken>(async (resolve, reject) => {
      let outputStorage;
      try {
        outputStorage = await this.gdaStorage.get({
          key: token.value,
          table: this.STORAGE_TOKEN_NAME_TABLE
        });
      } catch (e) {
        reject(new GetTokenFromStorageError(`The request to retrieve the token has failed`, token, this, e.message));
      }

      let storedToken: StoredToken;
      if (!outputStorage || !outputStorage.result) {
        reject(
          new GetTokenFromStorageError(`The request to retrieve the token from the storage has no result`, token, this)
        );
      } else {
        storedToken = outputStorage.result[this.STORAGE_TOKEN_NAME_COLUMN];
        resolve(storedToken);
      }
    });
  }
}
