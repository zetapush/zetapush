import {
  Credentials,
  AccountCreationDetails,
  ConfirmationRedirection,
  Account,
} from './standard-user-workflow/api';

export interface StandardUserWorkflow {
  login(credentials: Credentials): Account;
  logout();
  signup(
    accountCreationDetails: AccountCreationDetails,
    confirmationRedirection: ConfirmationRedirection,
  );
}
