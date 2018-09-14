import { Service } from '@zetapush/platform-legacy';
import { PendingAccountConfirmation, Redirection, Account, AccountCreationDetails, Credentials } from '../api';

/**
 * StandardUserWorflow client side implementation
 *
 * This class is use to create a AsyncTaskService on the client side.
 * So with this class you can directly call the StandardUserWorkflow methods
 * from the client side. (for signup, confirm, login, logout)
 *
 * @example
 * import { StandardUserWorkflowAsyncTaskService } from '@zetapush/user-management';
 * import { WeakClient } from '@zetapush/client';
 *
 * const client = new WeakClient();
 * const api = client.createAsyncTaskService({
 *  Type: StandardUserWorkflowAsyncTaskService
 * });
 */
export class StandardUserWorkflowAsyncTaskService extends Service {
  /**
   * signup method
   *
   * Create a user account on the application from AccountCreationDetails.
   * You can also use a Redirection parameter to change the confirmation account redirection
   *
   * @example
   * import { StandardUserWorkflowAsyncTaskService } from '@zetapush/user-management';
   * import { WeakClient } from '@zetapush/client';
   *
   * const client = new WeakClient();
   * const api = client.createAsyncTaskService({
   *  Type: StandardUserWorkflowAsyncTaskService
   * });
   *
   * const pendingAccountConfirmation = api.signup(
   *  {
   *    credentials: {
   *      login: 'myLogin';
   *      password: 'myPassword';
   *    },
   *    profile: {
   *      email: 'firstname.lastname@my-company.com',
   *      firstname: 'Firstname',
   *      lastname: 'Lastname'
   *    }
   *  }
   * );
   * @access public
   * @param accountDetails
   * @param confirmationRedirection
   */
  signup(
    accountDetails: AccountCreationDetails,
    confirmationRedirection?: Redirection
  ): Promise<PendingAccountConfirmation> {
    return this.$publish('signup', accountDetails, confirmationRedirection);
  }

  /**
   * confirm method
   *
   * Confirm a created account if necessary.
   * Change the status of the user account and enable the login of the user
   *
   * @example
   * import { StandardUserWorkflowAsyncTaskService } from '@zetapush/user-management';
   * import { WeakClient } from '@zetapush/client';
   *
   * const client = new WeakClient();
   * const api = client.createAsyncTaskService({
   *  Type: StandardUserWorkflowAsyncTaskService
   * });
   *
   * const redirection = api.confirm(
   *  {
   *    createdAccount: {
   *      accountId: 'my-account-id',
   *      accountStatus: 'waitingConfirmation',
   *      profile: {
   *        email: 'firstname.lastname@my-company.com',
   *        firstname: 'Firstname',
   *        lastname: 'Lastname'
   *      }
   *    },
   *    token: {
   *      value: 'my-token'
   *    }
   *  }
   * );
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
   * NOT IMPLEMENTED
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
   * NOT IMPLEMENTED
   *
   * Logout the user from the application
   *
   * @access public
   */
  logout(): Promise<void> {
    return this.$publish('logout');
  }
}
