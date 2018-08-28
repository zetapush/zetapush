import { RegistrationWelcomeConfigurer } from '../../common/configurer/grammar';
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
import { Token } from '../../common/api';
import { NoAccountCreatedError } from './exceptions/NoAccountCreatedError';

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

  async login() {
    // TODO
  }
}
