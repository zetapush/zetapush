import { Service } from '@zetapush/platform-legacy';
import { PendingAccountConfirmation, Redirection, Account, AccountCreationDetails, Credentials } from '../api';

/**
 * StandardUSerWWorflow client side implementation
 */
export class StandardUserWorkflowAsyncTaskService extends Service {

  /**
   * signup method
   * 
   * Create a user account on the application from AccountCreationDetails.
   * You can also use a Redirection parameter to change the confirmation account redirection 
   * 
   * @access public
   * @param accountDetails 
   * @param confirmationRedirection 
   */
  signup(accountDetails: AccountCreationDetails, confirmationRedirection?: Redirection): Promise<PendingAccountConfirmation> {
    return this.$publish('signup', accountDetails, confirmationRedirection);
  }

  /**
   * confirm method
   * 
   * Confirm a created account if necessary.
   * Change the status of the user account and enable the login of the user
   * 
   * @access public
   * @param confirmation 
   */
  confirm(confirmation: PendingAccountConfirmation): Promise<Redirection> {
    return this.$publish('confirm', confirmation);
  }

  /**
   * login method
   * 
   * Login the user on the application
   * 
   * @access public
   * @param credentials 
   */
  login(credentials: Credentials): Promise<Account> {
    return this.$publish('login', credentials);
  }

  /**
   * logout method
   * 
   * Logout the user from the application
   * 
   * @access public
   */
  logout(): Promise<void> {
    return this.$publish('logout');
  }
}