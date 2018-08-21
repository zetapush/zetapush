import { RegistrationWelcomeConfigurer } from '../../common/configurer/grammar';
import {
  AccountCreationManager,
  AccountConfirmationManager,
  AuthenticationManager,
  AccountCreationDetails,
  ConfirmationRedirection,
  PendingAccountConfirmation
} from '../api';
import { Token } from '../../common/api';
import { NoAccountCreatedError } from './exceptions/NoAccountCreatedError';

export class StandardUserWorkflow {
  constructor(
    private accountCreationManager: AccountCreationManager,
    private accountConfirmationManager: AccountConfirmationManager // private authenticationManager: AuthenticationManager
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

  async login() {
    // TODO
  }
}
