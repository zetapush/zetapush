import {
  Credentials,
  AccountCreationDetails,
  ConfirmationRedirection,
} from './standard-user-workflow/api';

export interface StandardUserWorkflow {
  login(credentials: Credentials);
  signup(
    accountCreationDetails: AccountCreationDetails,
    confirmationRedirection: ConfirmationRedirection,
  );
}
