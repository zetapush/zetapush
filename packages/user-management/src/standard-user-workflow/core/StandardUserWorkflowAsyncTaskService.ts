import { Service } from '@zetapush/platform-legacy';
import { PendingAccountConfirmation, Redirection, Account, AccountCreationDetails, Credentials } from '../api';
import { AccountDetailsResetPassword, PendingAskResetPassword, DetailsResetPassword } from '../api/LostPassword';

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
  askResetPassword(accountDetailsResetPassword: AccountDetailsResetPassword): Promise<PendingAskResetPassword> {
    return this.$publish('askResetPassword', accountDetailsResetPassword);
  }

  /**
   * After clicking in the link received by email when he asks to reset his password,
   * the user need to choose his new password. To do this, he needs to type a couple of identicals
   * password and validate them.
   *
   * @param newCoupleOfPassword Couple of new passwords
   */
  confirmResetPassword(detailsResetPassword: DetailsResetPassword): Promise<Account> {
    return this.$publish('confirmResetPassword', detailsResetPassword);
  }
}
