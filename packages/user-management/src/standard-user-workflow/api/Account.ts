import { Token, Message, SentMessage, EmailAddress } from '../../common/api';
import { BaseError } from '../../common/api/exception/BaseError';
import { Credentials } from './Credentials';

/**
 * The account creation manager is in charge to create a user account based
 * on provided account details.
 *
 * The AccountCreationDetails is just a marker interface. Account information
 * may vary a lot, that's why we use the interface to mark the concept.
 * The AccountCreationDetails should provide:
 * - information that will be used for the user login (for example: username/password)
 * - personal information about the user (for example: firstname, lastname, email, ...)
 *
 * The manager implementation may be able to handle only particular type
 * of account details. For example, UsernamePasswordAccountCreationManager may be
 * able to handle only UsernamePasswordAccountDetails. If the AccountCreationManager
 * is not able to handle a particular type of AccountCreationDetails, then the manager
 * must return null.
 *
 * Each AccountCreationManager may be configured to use an AccountDetailsProvider that
 * may add additional "static" account information just before account creation. For
 * example, front can provide 3 fields (email, firstname, lastname) through AccountCreationDetails
 * and the AccountDetailsProvider could add extra fields (role for example). AccountDetailsProvider
 * could also be used to completely rewrite the object sent by the front.
 *
 * Likewise, each AccountCreationManager may be configured to set initial account status
 * through an AccountStatusProvider. The aim is to be able to control the account lifecycle.
 *
 * @see LoginPasswordAccountCreationManager
 * @see LoginPasswordAccountDetails
 * @see AccountDetailsProvider
 * @see AccountStatusProvider
 */
export interface AccountCreationManager {
  /**
   * Create an account for a user in your application. If the AccountCreationManager
   * is not able to handle a particular type of AccountCreationDetails, then the manager
   * must return null.
   *
   * @param accountCreationDetails The account details used to register a user to your application
   * @returns information about the created account or null if account couldn't be handled
   * @throws {AccountCreationError} when creation couldn't be created
   */
  createAccount(accountCreationDetails: AccountCreationDetails): Promise<Account | null>;
}
export abstract class AccountCreationManagerInjectable implements AccountCreationManager {
  abstract createAccount(accountCreationDetails: AccountCreationDetails): Promise<Account | null>;
}

export class AccountCreationError extends BaseError {
  constructor(message: string, public details: AccountCreationDetails, public cause?: Error) {
    super(message);
  }
}

/**
 * This interface is used while creating a user account. The aim
 * is:
 * - either to add fields to the object sent by the front (like role field) for example
 * - or to completely rewrite profile information sent by the front in order to decorrelate front and worker objects
 *
 * @see AccountCreationManager
 */
export interface AccountDetailsProvider {
  /**
   * Either add fields to the original profile or completely rewrite the
   * profile.
   *
   * @param original the original object that may contain user profile information
   */
  getUserProfile(original: any): Promise<UserProfile>;
}
export abstract class AccountDetailsProviderInjectable implements AccountDetailsProvider {
  abstract getUserProfile(original: any): Promise<UserProfile>;
}

/**
 * The 'AccountConfirmationManager' is in charge to manage the account confirmation
 * in an application. In many applications, a user account need to be validated to be used.
 *
 * The 'AccountConfirmationManager' is just a marker interface. Account confirmation process
 * may vary a lot, that's why we use the interface to mark the concept.
 * This interface exposes you two methods :
 *  - 'askConfirmation()' to launch the validation process for a created account
 *  - 'confirm()' to validate a created account
 *
 * The account confirmation process may vary a lot. For example,
 * 'TemplatedMessageAccountConfirmationManager' is an implementation of AccountConfirmationManager
 * that send an email to validate the account via a link.
 * You can choose your implementation depending of your case or create your own implementation.
 *
 * @see TemplatedMessageAccountConfirmationManager
 * @see Account
 * @see PendingAccountConfirmation
 * @see Token
 * @see ConfirmedAccount
 */
export interface AccountConfirmationManager {
  /**
   * Ask the confirmation of a created account.
   *
   * accountToConfirm can takes many different forms. In the case of we use the login/password
   * connection process this is an account ID, an account status and an user profile.
   * This can be very different in other case, for example in the case of a GitHub OAuth authentication.
   *
   * @param {Account} accountToConfirm Created account that we want to ask confirmation
   * @returns {Promise<PendingAccountConfirmation>} Object that includes the ID of the created account and the token to validate it
   */
  askConfirmation(accountToConfirm: Account): Promise<PendingAccountConfirmation>;

  /**
   * Confirm a pending confirmation account
   *
   * @param {PendingAccountConfirmation} confirmation Unique token to validate a specific account
   * @returns {Promise<ConfirmedAccount} Object with the accountId, the status of the account and the user profile
   */
  confirm(confirmation: PendingAccountConfirmation): Promise<ConfirmedAccount>;
}
export abstract class AccountConfirmationManagerInjectable implements AccountConfirmationManager {
  abstract askConfirmation(accountToConfirm: Account): Promise<PendingAccountConfirmation>;
  abstract confirm(confirmation: PendingAccountConfirmation): Promise<ConfirmedAccount>;
}

/**
 * The AccountConfirmationMessageManager is used to manage the confirmation messages.
 *
 * It uses the send the confirmation message to let the user validate his account.
 * To do this, you need to use a Message instance that will be anything.
 * For example a Message can by an Email.
 */
export interface AccountConfirmationMessageManager {
  send(message: Message): Promise<SentMessage>;
}
export abstract class AccountConfirmationMessageManagerInjectable implements AccountConfirmationMessageManager {
  abstract send(message: Message): Promise<SentMessage>;
}

/**
 * The information about the account of a user.
 * The account has:
 * - a unique technical identifier (accountId)
 * - a status (active, waiting for confirmation, disabled, ...)
 * - optional information about the user (username, firstname, lastname, ...)
 *
 * The account information and associated user profile information may
 * vary a lot according of the type of created account. For example, an
 * account created by a signup form may contain some fields that may not be
 * available when user signs up using Google/Facebook/Github authentication.
 * Likewise, an account created using an external system (LDAP/Active Directory)
 * may have different information.
 */
export interface Account {
  accountId: string;
  accountStatus: AccountStatus;
  profile: UserProfile;
}

/**
 * Interface used to provide a status for the user account.
 *
 * The status is used to know if the account is currently
 * active (the user is able to login to the application) or
 * not. Other statuses are used to indicate the reason why
 * the user is not allowed to login (the account may not
 * have been confirmed yet or the account has been disabled).
 *
 */
export interface AccountStatusProvider {
  /**
   * Provide a status for the user account. The account status
   * is used to manage the validity of the account.
   *
   * If you don't need account validity management, you can
   * return null.
   */
  getStatus(): Promise<AccountStatus>;
}
export abstract class AccountStatusProviderInjectable implements AccountStatusProvider {
  abstract getStatus(): Promise<AccountStatus>;
}

/**
 * Define the status of an account (example : 'active' / 'waitingConfirmation' / 'disabled')
 */
export type AccountStatus = string;

/**
 * Information of the user
 * That includes for example the username, birthdate, gender...
 */
export interface UserProfile {
  [property: string]: any;
}

/**
 * Necessary informations for the account creation process
 * These informations may vary a lot. In the case of a username/password
 * login process with an email confirmation, the needed informations are
 * the login, the email, the password (x2 for confirmation password).
 */
export interface AccountCreationDetails {
  credentials: Credentials;
  profile?: UserProfile;
}

/**
 * This is returned when an account is validated.
 * By default it includes the same informations that an Account
 * but it can takes extra informations if you want.
 *
 * @see Account
 */
export interface ConfirmedAccount extends Account {}

/**
 * Returned when you ask an account confirmation
 */
export interface PendingAccountConfirmation {
  createdAccount: Partial<Account>;
  token: Token;
}

export interface AccountDetails {
  accountId: string;
}

export interface EmailAddressProvider {
  getEmailAddress(account: Account): Promise<EmailAddress>;
}
export abstract class EmailAddressProviderInjectable {
  abstract getEmailAddress(account: Account): Promise<EmailAddress>;
}
