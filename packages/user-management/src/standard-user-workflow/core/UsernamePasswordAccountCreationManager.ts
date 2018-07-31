import { Simple } from '@zetapush/platform';
import {
  AccountCreationManager,
  AccountCreationDetails,
  Account,
  AccountDetailsProvider,
  AccountStatusProvider,
  UserProfile,
  AccountCreationError
} from '../api';
import { UuidGenerator, IllegalArgumentError, IllegalArgumentValueError } from '../../common/api';
import { IllegalStateError } from '../../common/api/exception/IllegalStateError';

export interface UsernamePasswordAccountDetails extends AccountCreationDetails {
  /**
   * @param {string} username The unique username that will be later used for authentication
   */
  username: string;
  /**
   * @param {string} password The password that will be later used for authentication
   */
  password: string;
  /**
   * @param {string} profile Additional personal information about the user (ex: firstname, lastname, ...)
   */
  profile?: any;
}

export class DefaultUsernamePasswordAccountDetails implements UsernamePasswordAccountDetails {
  constructor(public username: string, public password: string, public profile?: any) {}
}

export class UsernameAlreadyUsedError extends AccountCreationError {
  constructor(message: string, details: AccountCreationDetails) {
    super(message, details);
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
export class UsernamePasswordAccountCreationManager implements AccountCreationManager {
  constructor(
    private userService: Simple,
    private uuidGenerator: UuidGenerator,
    private accountStatusProvider: AccountStatusProvider,
    private additionalAccountDetailsProvider?: AccountDetailsProvider
  ) {}

  async createAccount(accountCreationDetails: AccountCreationDetails): Promise<Account | null> {
    if (!this.supports(accountCreationDetails)) {
      return null;
    }
    const details = <UsernamePasswordAccountDetails>accountCreationDetails;
    // TODO: configure local authentication service, use default values or retrieve configuration to use it ?
    // TODO: configure mandatory fields (not really necessary thanks to validator) ?
    // TODO: configure public fields or use custom search ?
    try {
      const { value: accountId } = await this.uuidGenerator.generate();
      const accountStatus = await this.accountStatusProvider.getStatus();
      const userProfile = await this.getUserProfile(details);
      const result = await this.userService.createUser({
        accountId,
        accountStatus,
        login: details.username,
        password: details.password,
        userProfile
      });
      // TODO: logs
      console.log('result', result);
      // TODO: transform raw result to something usable ?
      return {
        accountId,
        accountStatus,
        userProfile
      };
    } catch (e) {
      // TODO: logs
      console.error(e);
      if (e.code === 'MISSING_MANDATORY_FIELDS') {
        // If this error is thrown, it means that ZetaPush has not done its job (the service is not correctly configured).
        // So the error is not a AccountCreationError.
        throw new IllegalStateError(`Simple service seems to be misconfigured. 
          The platform has thrown an error with code MISSING_MANDATORY_FIELDS.
          It seems that there is a difference between Simple.simpleauth_mandatoryFields configuration and what UsernamePasswordAccountCreationManager provides. 
          
          This is a ZetaPush issue, please report this error on Github: https://github.com/zetapush/zetapush/issues/new`);
      } else if (e.code === 'ACCOUNT_EXISTS') {
        throw new UsernameAlreadyUsedError(`Username "${details.username}" is already used`, accountCreationDetails);
      } else if (e.code === 'KEY_BADCHAR') {
        // TODO: add validation to prevent this error sooner ?
        throw new AccountCreationError(
          `Username "${details.username} contains forbidden character(s)`,
          accountCreationDetails,
          new IllegalArgumentValueError(
            `Platform doesn't allow character ':' in Simple.login field`,
            'username',
            details.username,
            e
          )
        );
      }
      throw new AccountCreationError(`Account creation for '${details.username} has failed`, accountCreationDetails);
    }
  }

  private supports(accountCreationDetails: AccountCreationDetails) {
    return (
      (<UsernamePasswordAccountDetails>accountCreationDetails).username &&
      (<UsernamePasswordAccountDetails>accountCreationDetails).password
    );
  }
  private async getUserProfile(details: UsernamePasswordAccountDetails): Promise<UserProfile> {
    if (this.additionalAccountDetailsProvider) {
      return await this.additionalAccountDetailsProvider.getUserProfile(details);
    } else {
      return details.profile;
    }
  }
}
