import { Simple } from '../../../Simple';
import {
  AccountCreationManager,
  AccountCreationDetails,
  Account,
  AccountDetailsProvider,
  AccountStatusProvider,
  UserProfile,
  AccountCreationError
} from '../api';
import { UuidGenerator } from '../../../common/api';

export class UsernamePasswordAccountDetails implements AccountCreationDetails {
  /**
   * The unique username that will be later used for authentication
   */
  username: string;
  /**
   * The password that will be later used for authentication
   */
  password: string;
  /**
   * Additional personal information about the user (ex: firstname, lastname, ...)
   */
  profile?: any;
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

  async createAccount(accountCreationDetails: AccountCreationDetails): Promise<Account> {
    if (accountCreationDetails instanceof UsernamePasswordAccountDetails) {
      return null;
    }
    const details = <UsernamePasswordAccountDetails>accountCreationDetails;
    // TODO: configure local authentication service
    // TODO: configure mandatory fields (not really necessary thanks to validator)
    // TODO: configure public fields
    // TODO: provide profile information. /!\ not all fields of the profile are public !!!!!!
    // TODO: store user profile information in a "real" database to dissociate public fields from private fields ?
    try {
      const { value: accountId } = await this.uuidGenerator.generate();
      const accountStatus = await this.accountStatusProvider.getStatus();
      const userProfile = await this.getUserProfile(details);
      // const result = await this.userService.createUser({
      //   accountId,
      //   accountStatus,
      //   login: details.username,
      //   password: details.password,
      //   userProfile
      // });
      // // TODO: logs
      // console.log('result', result);
      // TODO: transform raw result to something usable
      return {
        accountId,
        accountStatus,
        userProfile
      };
    } catch (e) {
      // TODO: catch errors and handle them
      if (e.code === 'MISSING_MANDATORY_FIELDS') {
        // TODO
      } else if (e.code === 'ACCOUNT_EXISTS') {
        throw new UsernameAlreadyUsedError(`Username "${details.username}" is already used`, accountCreationDetails);
      } else if (e.code === 'KEY_BADCHAR') {
        // TODO
      }
    }
  }

  private async getUserProfile(details): Promise<UserProfile> {
    if (this.additionalAccountDetailsProvider) {
      return await this.additionalAccountDetailsProvider.getUserProfile(details);
    } else {
      return details.profile;
    }
  }
}
