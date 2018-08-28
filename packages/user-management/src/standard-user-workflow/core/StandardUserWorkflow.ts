import {
  AccountCreationManager,
  AccountConfirmationManager,
  AuthenticationManager,
  AccountCreationDetails,
  PendingAccountConfirmation,
  Redirection,
  RedirectionProvider,
  ConfirmedAccount
} from '../api';
import { NoAccountCreatedError } from './exceptions/NoAccountCreatedError';
import { Credentials, Account } from '../api';

export class StandardUserWorkflow {
  constructor(
    private accountCreationManager: AccountCreationManager,
    private accountConfirmationManager: AccountConfirmationManager,
    private success: RedirectionProvider<ConfirmedAccount>,
    private failure: RedirectionProvider<Error>
  ) {}

  async signup(accountDetails: AccountCreationDetails, confirmationRedirection?: Redirection) {
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
    try {
      const confirmedAccount = await this.accountConfirmationManager.confirm(confirmation);
      // TODO: send welcome message (asynchronously)
      return await this.success.getRedirection(confirmedAccount);
    } catch (e) {
      // TODO: log
      console.error(`Failed to confirm account ${confirmation.createdAccount.accountId}. Cause: ${e.toString()}`, e);
      return await this.failure.getRedirection(e);
    }
  }

  /**
   * Allows a user to log into the application.
   * To do this, he need to use his credentials
   * @param credentials Credentials of the user. Can be in several forms (Login/Password or Oauth for example)
   * @returns Account of the connected user
   */
  async login(credentials: Credentials): Promise<Account> {
    throw 'Method not implemented';
  }

  /**
   * Allows a user to log out the application.
   */
  async logout(): Promise<void> {
    throw 'Method not implemented';
  }
}
