import {
  AccountCreationManager,
  AccountCreationDetails,
  Account,
  AccountDetailsProvider,
  AccountStatusProvider,
  UserProfile,
  AccountCreationError,
  LoginPasswordCredentials
} from '../../../api';
import { UuidGenerator } from '../../../../common/api';
import { UserRepository } from '../../../../common/api/User';
import { LoginAlreadyUsedError } from '../../exceptions/AccountCreationError';

export interface LoginPasswordAccountDetails extends AccountCreationDetails {
  credentials: {
    /**
     * @param {string} login The unique login that will be later used for authentication
     */
    login: string;
    /**
     * @param {string} password The password that will be later used for authentication
     */
    password: string;
  };
  /**
   * @param {string} profile Additional personal information about the user (ex: firstname, lastname, ...)
   */
  profile?: UserProfile;
}

export class DefaultLoginPasswordAccountDetails implements LoginPasswordAccountDetails {
  public credentials: LoginPasswordCredentials;

  constructor(login: string, password: string, public profile?: UserProfile) {
    this.credentials = { login, password };
  }
}

/**
 * Create the account using ZetaPush cloud service.
 *
 * The account is created using a login and a password. Login and password will later be used
 * by the user to log in your application.
 *
 * The account creation may also use data provided in profile to store data about
 * the user.
 *
 * When the account is created, a status (AccountStatus) is set to indicate the
 * initial state of the confirmation process.
 */
export class LoginPasswordAccountCreationManager implements AccountCreationManager {
  constructor(
    private userRepository: UserRepository,
    private uuidGenerator: UuidGenerator,
    private accountStatusProvider: AccountStatusProvider,
    private additionalAccountDetailsProvider?: AccountDetailsProvider
  ) {}

  async createAccount(accountCreationDetails: AccountCreationDetails): Promise<Account | null> {
    if (!this.supports(accountCreationDetails)) {
      return null;
    }
    const details = <LoginPasswordAccountDetails>accountCreationDetails;
    try {
      const { value: accountId } = await this.uuidGenerator.generate();
      const accountStatus = await this.accountStatusProvider.getStatus();
      const profile = await this.getUserProfile(details);
      const credentials = this.toCredentials(details);
      if (await this.userRepository.exists(credentials)) {
        throw new LoginAlreadyUsedError(
          `Login "${details.credentials.login}" is already used`,
          details,
          details.credentials.login
        );
      }
      const account = await this.userRepository.addUser(credentials, profile, accountStatus, accountId);

      return {
        accountId: account.accountId || accountId,
        accountStatus: account.accountStatus,
        profile: account.profile
      };
    } catch (e) {
      if (e instanceof AccountCreationError) {
        throw e;
      } else {
        throw new AccountCreationError(
          `Account creation for '${details.credentials.login} has failed`,
          accountCreationDetails,
          e
        );
      }
    }
  }

  private toCredentials(details: LoginPasswordAccountDetails) {
    return details.credentials;
  }

  private supports(accountCreationDetails: AccountCreationDetails) {
    return (
      (<LoginPasswordAccountDetails>accountCreationDetails).credentials.login &&
      (<LoginPasswordAccountDetails>accountCreationDetails).credentials.password
    );
  }
  private async getUserProfile(details: LoginPasswordAccountDetails): Promise<UserProfile> {
    if (this.additionalAccountDetailsProvider) {
      return await this.additionalAccountDetailsProvider.getUserProfile(details);
    } else {
      return details.profile || {};
    }
  }
}
