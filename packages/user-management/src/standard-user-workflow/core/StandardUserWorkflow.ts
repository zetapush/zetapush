import {
  AccountCreationManager,
  AccountConfirmationManager,
  AccountCreationDetails,
  PendingAccountConfirmation,
  Redirection,
  RedirectionProvider,
  ConfirmedAccount,
  AskResetPasswordAccount,
  ConfirmResetPasswordAccount
} from '../api';
import { NoAccountCreatedError } from './exceptions/NoAccountCreatedError';
import { Credentials, Account } from '../api';
import {
  AskResetPasswordManager,
  AccountDetailsResetPassword,
  PendingAskResetPassword,
  DetailsResetPassword,
  ConfirmResetPasswordManager
} from '../api/LostPassword';

export class StandardUserWorkflow {
  constructor(
    private accountCreationManager: AccountCreationManager,
    private accountConfirmationManager: AccountConfirmationManager,
    private askResetPasswordManager: AskResetPasswordManager,
    private confirmResetPasswordManager: ConfirmResetPasswordManager,
    private successConfirmationAccount: RedirectionProvider<ConfirmedAccount>,
    private failureConfirmationAccount: RedirectionProvider<Error>
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
      return await this.successConfirmationAccount.getRedirection(confirmedAccount);
    } catch (e) {
      // TODO: log
      console.error(`Failed to confirm account ${confirmation.createdAccount.accountId}. Cause: ${e.toString()}`, e);
      return await this.failureConfirmationAccount.getRedirection(e);
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

  /**
   * The askResetPassword method let your user asks to reset his password.
   * The process is the following :
   * 1) The user asks to reset his password providing his email
   * 2) A link is sent to his email
   * 3) When the user click on this link, the user is redirected to a page specified by the developer to change his password
   * 4) When the user validate the new password, he is redirected to a page specified by the developer
   *
   * @param accountDetailsResetPassword Necessary input for reset a password
   */
  async askResetPassword(accountDetailsResetPassword: AccountDetailsResetPassword): Promise<PendingAskResetPassword> {
    try {
      return await this.askResetPasswordManager.askResetPassword(accountDetailsResetPassword);
    } catch (e) {
      console.error(`Failed to ask reset password for ${accountDetailsResetPassword}. Cause: ${e.toString()}`, e);
      throw e;
    }
  }

  /**
   * After clicking in the link received by email when he asks to reset his password,
   * the user need to choose his new password. To do this, he needs to type a couple of identicals
   * password and validate them.
   *
   * @param newCoupleOfPassword Couple of new passwords
   */
  async confirmResetPassword(detailsResetPassword: DetailsResetPassword): Promise<Account> {
    try {
      return await this.confirmResetPasswordManager.confirmResetPassword(detailsResetPassword);
    } catch (e) {
      console.error(
        `Failed to confirm reset password with passwords ${detailsResetPassword.firstPassword} / ${
          detailsResetPassword.secondPassword
        }. Cause: ${e.toString()}`,
        e
      );
      throw e;
    }
  }
}
