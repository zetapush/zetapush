import { UserRepository } from '../../common/api/User';
import { IllegalStateError, IllegalArgumentValueError, BootstrapError } from '../../common/api';
import { Simple, Gda, GdaConfigurer, GdaDataType, Idempotence } from '@zetapush/platform-legacy';
import { UserProfile, AccountStatus, LoginPasswordCredentials, Account } from '../api';
import { Bootstrappable, Injectable } from '@zetapush/core';
import { BaseError } from '@zetapush/common';
import { StandardAccountStatus } from '../core/account';

export class LegacySimpleError extends BaseError {
  constructor(message: string, public cause?: Error) {
    super(message);
  }
}

export class LegacyUpdateAccountStatus extends LegacySimpleError {
  constructor(message: string, public cause?: Error) {
    super(message);
  }
}

export class LoginAlreadyUsedError extends LegacySimpleError {
  constructor(message: string, public login: string) {
    super(message);
  }
}

export class AccountIdAssociationLoadError extends LegacySimpleError {
  constructor(message: string, public accountId: string, cause?: Error) {
    super(message, cause);
  }
}

export const USER_LEGACY_ADAPTER_TABLE_SIMPLE_ASSOCIATIONS = 'LegacySimpleAssociations';
export const USER_LEGACY_ADAPTER_COLUMN_DATA = 'data';

export class LegacyAdapterUserRepositoryBootstrapError extends BootstrapError {}

@Injectable()
export class LegacyAdapterUserRepository implements Bootstrappable, UserRepository {
  constructor(private simple: Simple, private gda: Gda, private gdaConfigurer: GdaConfigurer) {}

  async onApplicationBootstrap() {
    try {
      await this.gdaConfigurer.createTable({
        name: USER_LEGACY_ADAPTER_TABLE_SIMPLE_ASSOCIATIONS,
        columns: [
          {
            name: USER_LEGACY_ADAPTER_COLUMN_DATA,
            type: GdaDataType.OBJECT,
            map: false
          }
        ],
        idempotence: Idempotence.IGNORE_IDENTICAL
      });
    } catch (e) {
      // TODO: logs
      console.error(e);
      throw new LegacyAdapterUserRepositoryBootstrapError(`Failed to create table for associations`, e);
    }
  }

  async exists(credentials: LoginPasswordCredentials): Promise<boolean> {
    try {
      const user = await this.simple.checkUser({ key: credentials.login });
      return !!user;
    } catch (e) {
      if (e.code) {
        return e.code !== 'NO_ACCOUNT';
      }
      throw new LegacySimpleError(`Failed to check if user ${credentials.login} exists`, e);
    }
  }

  async addUser(
    credentials: LoginPasswordCredentials,
    userProfile: UserProfile,
    accountStatus: AccountStatus,
    accountId: string
  ): Promise<Account> {
    // FIXME: once user is created, he can already login. Need platform evolution
    // TODO: configure local authentication service, use default values or retrieve configuration to use it ?
    // TODO: configure mandatory fields (not really necessary thanks to validator) ?
    // TODO: configure public fields or use custom search ?
    try {
      const result = await this.simple.createAccount({
        fields: {
          login: credentials.login,
          password: credentials.password,
          userProfile,
          accountStatus,
          accountId
        },
        status: { active: false }
      });

      if (result.userKey && result.fields) {
        await this.saveAssociations(accountId, result.userKey, result.fields.login);

        return {
          accountId,
          accountStatus,
          profile: userProfile
        };
      } else {
        throw new LegacySimpleError(`Account creation for '${credentials.login}' has failed`);
      }
    } catch (e) {
      // TODO: logs
      console.error(e);
      if (e.code === 'MISSING_MANDATORY_FIELDS') {
        // If this error is thrown, it means that ZetaPush has not done its job (the service is not correctly configured).
        // So the error is not a AccountCreationError.
        throw new IllegalStateError(`Simple service seems to be misconfigured. 
          The platform has thrown an error with code MISSING_MANDATORY_FIELDS.
          It seems that there is a difference between Simple.simpleauth_mandatoryFields configuration and what LegacyAdapterUserRepository provides. 
          
          This is a ZetaPush issue, please report this error on Github: https://github.com/zetapush/zetapush/issues/new`);
      } else if (e.code === 'ACCOUNT_EXISTS') {
        throw new LoginAlreadyUsedError(`Login "${credentials.login}" is already used`, credentials.login);
      } else if (e.code === 'KEY_BADCHAR') {
        // TODO: add validation to prevent this error sooner ?
        throw new LegacySimpleError(
          `Login "${credentials.login} contains forbidden character(s)`,
          new IllegalArgumentValueError(
            `Platform doesn't allow character ':' in Simple.login field`,
            'login',
            credentials.login,
            e
          )
        );
      } else if (e instanceof LegacySimpleError) {
        throw e;
      }
      throw new LegacySimpleError(`Account creation for '${credentials.login}' has failed`, e);
    }
  }

  async getProfile(accountId: string): Promise<UserProfile> {
    let columns;
    try {
      const { result } = await this.gda.get({
        table: USER_LEGACY_ADAPTER_TABLE_SIMPLE_ASSOCIATIONS,
        key: accountId
      });
      columns = result;
    } catch (e) {
      throw new AccountIdAssociationLoadError(`Failed to retrieve userKey/login from accountId`, accountId, e);
    }
    if (!columns) {
      throw new AccountIdAssociationLoadError(
        `Empty response while retrieving userKey/login from accountId`,
        accountId
      );
    }
    const userInfo = await this.simple.checkUser({ key: columns[USER_LEGACY_ADAPTER_COLUMN_DATA].login });
    return userInfo.userProfile;
  }

  /**
   * Get the login of a user from his ID
   * @param accountId unique ID of a user
   */
  private async getLoginFromAccountId(accountId: string): Promise<string> {
    let columns;
    try {
      const { result } = await this.gda.get({
        table: USER_LEGACY_ADAPTER_TABLE_SIMPLE_ASSOCIATIONS,
        key: accountId
      });
      columns = result;
    } catch (e) {
      throw new AccountIdAssociationLoadError(`Failed to retrieve userKey/login from accountId`, accountId, e);
    }
    if (!columns) {
      throw new AccountIdAssociationLoadError(
        `Empty response while retrieving userKey/login from accountId`,
        accountId
      );
    }

    return columns[USER_LEGACY_ADAPTER_COLUMN_DATA].login;
  }

  /**
   * Update the status of an user (active of inactive)
   * @param accountId Unique ID of the user account
   * @param newStatus The new status of the user account (active or inactive)
   */
  async updateStatus(accountId: string, newStatus: AccountStatus): Promise<void> {
    // Get the user account from his ID
    try {
      const login = await this.getLoginFromAccountId(accountId);

      let userAccountActivated = false;
      if (newStatus === StandardAccountStatus.Active) {
        userAccountActivated = true;
      }

      const result = await this.simple.setStatus({
        status: {
          active: userAccountActivated
        },
        key: login
      });

      if (result.fields) {
        await this.simple.updateAccount({
          key: result.fields.login,
          fields: {
            accountStatus: newStatus
          }
        });
      }

      console.log('====> USER ACCOUNT\n', JSON.stringify(await this.simple.checkAccount({ key: 'login' }), null, 4));
    } catch (e) {
      throw new LegacyUpdateAccountStatus(`Failed to update the status of the user (accountId: ${accountId}.`, e);
    }
  }

  /**
   * Save the association between an accountId and his login and his userKey
   * @param accountId unique ID of the user
   * @param userKey Technical ID of the user (inherent of the ZetaPush platform)
   * @param login Login of the user account
   */
  private async saveAssociations(accountId: string, userKey: string, login: string) {
    await this.gda.put({
      table: USER_LEGACY_ADAPTER_TABLE_SIMPLE_ASSOCIATIONS,
      column: USER_LEGACY_ADAPTER_COLUMN_DATA,
      key: accountId,
      data: {
        userKey,
        login
      }
    });
  }
}
