import {
  Credentials,
  AccountCreationDetails,
  ConfirmationRedirection,
  Account,
} from './standard-user-workflow/api';

/**
 * The 'StandardUserWorkflow' is the standard process of users management in the application.
 * This interface exposes methods manage an user account on the application (sign up / login / logout ...)
 *
 * 'StandardUserWorkflow' has many implementations, the first one is the 'DefaultStandardUserWorkflow'.
 * This is the default process for a web application to create an account (form + confirmation link in email),
 * login (with username/password credentials) and logout.
 *
 * The 'StandardUserWorkflow' use the following process to create an account :
 * 1. The user fill the registration form
 * 2. The user receives an email with a link to validate his account
 * 3. The user click on the link in the email
 * 4. The user's account is validated and the user is redirected to a specific page in the application
 * 5. The user is automatically connected to the application
 */
export interface StandardUserWorkflow {
  /**
   * The 'login()' method allows an user to log into the application.
   * The user need to have an 'active' account. So the account need to be validated if the workflow imply it.
   *
   * This method return an 'Account' object. This is the ID of the
   * account (unique ID on the application), his status ('active', 'waitingConfirmation' or 'disabled')
   * and the user profile (the username, email and other informations)
   *
   * Credentials param can be in many forms.
   * In the DefaultStandardUserWorkflow, the credentials are an username and a password.
   *
   * @example
   * // 'DefaultStandardUserWorkflow' is the default implementation of 'StandardUserWorkflow'
   * import { DefaultStandardUserWorkflow } from "@zetapush/platform";
   *
   * const userManagement = new DefaultStandardUserWorkflow();
   *
   * userManagement.login({ username: 'username', password: 'password'}).then((account) => {
   *  console.log('connectedUser', account);
   * });
   * @param credentials Credentials informations to login
   * @returns {Account} ID + status of the account and user profile
   */
  login(credentials: Credentials): Account;

  /**
   * The 'logout()' method allows the current user to disconnect from the application.
   *
   * @example
   * // 'DefaultStandardUserWorkflow' is the default implementation of 'StandardUserWorkflow'
   * import { DefaultStandardUserWorkflow } from "@zetapush/platform";
   *
   * const userManagement = new DefaultStandardUserWorkflow();
   *
   * userManagement.logout().then((account) => {
   *  console.log('UserDisconnected', account);
   * });
   *
   * @returns {Account} ID, status of the account and user profile
   */
  logout(): Account;

  /**
   * 'signup()' method is used to create an user account on the application.
   * To do this, you need to pass the informations of the account creation and the optional confirmation redirection link.
   *
   * The 'accountCreationDetails' can take many differents paramaters. In the 'DefaultStandardUserWorkflow' context, you need to pass
   * username, email, password and passwordConfirmation.
   *
   * If you use an account validation process, you can specify on which URL the
   * user will be redirected after the account confirmation. By default this is : 'https://<urlofmyapp>/#/account-confirmation/<confirmation-token>.
   * You can set this URL using the 'confirmationRedirection' parameter.
   *
   * If the 'signup()' method return any error, the account creation is not effective.
   *
   * @example
   * // Nominal example
   * // 'DefaultStandardUserWorkflow' is the default implementation of 'StandardUserWorkflow'
   * import { DefaultStandardUserWorkflow } from "@zetapush/platform";
   *
   * const userManagement = new DefaultStandardUserWorkflow();
   *
   * userManagement.signup(accountCreatienDetails: { username: 'username', email: 'username@mail.fr', password: 'password', passwordConfirmation: 'password'}).then((createdAccount) => {
   *  console.log('createdAccout', createdAccount);
   * });
   *
   * @example
   * // Error example
   * // 'DefaultStandardUserWorkflow' is the default implementation of 'StandardUserWorkflow'
   * import { DefaultStandardUserWorkflow } from "@zetapush/platform";
   *
   * const userManagement = new DefaultStandardUserWorkflow();
   *
   * userManagement.signup(accountCreatienDetails: { username: 'username', email: 'username@mail.fr', password: 'password', passwordConfirmation: 'password'})
   *  .then((createdAccount) => {
   *    console.log('createdAccout', createdAccount);
   *  })
   *  .catch((error) => {
   *    console.log(`[${error.code}] - ${error.message}`);
   *    // This will display this message for example
   *    // [ERR-PWD-DIFFERENT] - The 'password' and the 'passwordConfirmation' are differents
   *  });
   *
   * @param {AccountCreationDetails} accountCreationDetails Details of the account to be created (Credentials / properties / ...)
   * @param {ConfirmationDirection} confirmationRedirection Optional redirection when an account is confirmed
   * @returns {Account} ID, status of the account and user profile
   */
  signup(
    accountCreationDetails: AccountCreationDetails,
    confirmationRedirection?: ConfirmationRedirection,
  ): Account;
}
