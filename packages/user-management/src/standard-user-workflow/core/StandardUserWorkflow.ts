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
import { debugObject } from '@zetapush/common';

export class StandardUserWorkflow {
  constructor(
    protected accountCreationManager: AccountCreationManager,
    protected accountConfirmationManager: AccountConfirmationManager,
    protected success: RedirectionProvider<ConfirmedAccount>,
    protected failure: RedirectionProvider<Error>
  ) {}

  async signup(accountDetails: AccountCreationDetails, confirmationRedirection?: Redirection) {
    try {
      const account = await this.accountCreationManager.createAccount(accountDetails);
      if (!account) {
        throw new NoAccountCreatedError(
          'Account creation manager could not handle account details. Account has not been created',
          accountDetails
        );
      }

      return await this.accountConfirmationManager.askConfirmation(account);
    } catch (e) {
      // TODO: log
      console.error(`Failed to create account for ${accountDetails.profile}. Cause: ${e.toString()}`, e);
      throw e;
    }
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
    throw `
    This method is not implemented.

    You need to use the ZetaPush SDK to connect your user to your application.
    You create a new SmartClient, set credentials and call the 'connect()' method.

    const client = new SmartClient();
    await client.setCredentials({ login: 'login', password: 'password' });
    await client.connect();

    `;
  }

  /**
   * Allows a user to log out the application.
   */
  async logout(): Promise<void> {
    throw `
    This method is not implemented.

    You need to use the ZetaPush SDK to disconnect your user from your application.
    You create a new SmartClient and call the 'disconnect()' method.

    const client = new SmartClient();
    await client.disconnect();
    
    `;
  }
}
