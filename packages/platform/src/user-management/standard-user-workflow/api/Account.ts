import { Token, Message, SentMessage } from '../../../common/api';

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
 * @see UsernamePasswordAccountCreationManager
 * @see UsernamePasswordAccountDetails
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
  signup(accountCreationDetails: AccountCreationDetails): Promise<Account>;
}

export class AccountCreationError extends Error {
  constructor(message: string, protected details: AccountCreationDetails) {
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

export interface AccountConfirmationManager {
  askConfirmation(
    accountToConfirm: Account,
  ): Promise<PendingAccountConfirmation>;
  confirm(token: Token): Promise<ConfirmedAccount>;
}

export interface AccountConfirmationMessageManager {
  send(message: Message): Promise<SentMessage>;
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
  userProfile: UserProfile;
}

export interface AccountStatusProvider {
  getStatus(): Promise<AccountStatus>;
}

export enum AccountStatus {
  active = 'ACTIVE',
  waitingConfirmation = 'WAITING_FOR_CONFIRMATION',
  disabled = 'DISABLED',
}

export interface UserProfile {}

export interface AccountCreationDetails {}

export interface ConfirmedAccount extends Account {}

export interface PendingAccountConfirmation {
  createdAccountId: string;
  token: Token;
}
