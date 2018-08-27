import {
  AccountCreationManager,
  AccountConfirmationManager,
  AuthenticationManager,
  AccountCreationDetails,
  ConfirmationRedirection,
  PendingAccountConfirmation
} from '../api';
import { NoAccountCreatedError } from './exceptions/NoAccountCreatedError';
import { Credentials, Account } from '../api';

export class StandardUserWorkflow {
  constructor(
    private accountCreationManager: AccountCreationManager,
    private accountConfirmationManager: AccountConfirmationManager,
    private authenticationManager: AuthenticationManager
  ) {}

  async signup(accountDetails: AccountCreationDetails, confirmationRedirection?: ConfirmationRedirection) {
    const account = await this.accountCreationManager.createAccount(accountDetails);
    if (!account) {
      throw new NoAccountCreatedError(
        'Account creation manager could not handle account details. Account has not been created',
        accountDetails
      );
    }
    return await this.accountConfirmationManager.askConfirmation(account);
  }

  async confirm(confirmation: PendingAccountConfirmation) {
    await this.accountConfirmationManager.confirm(confirmation);
    // TODO: redirect
    // TODO: send welcome message
  }

  /**
   * Allows a user to log into the application.
   * To do this, he need to use his credentials
   * @param credentials Credentials of the user. Can be in several forms (Login/Password or Oauth for example)
   * @returns Account of the connected user
   */
  async login(credentials: Credentials): Promise<Account> {
    return this.authenticationManager.login(credentials);
  }

  /**
   * Allows a user to log out the application.
   */
  async logout(): Promise<void> {
    return this.authenticationManager.logout();
  }
}
