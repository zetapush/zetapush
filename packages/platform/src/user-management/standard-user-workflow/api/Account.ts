import { Token, Message, SentMessage } from '../../../common/api';

/**
 * ================================
 * Account Managers
 * ================================
 */
export interface AccountCreationManager {
  signup(accountCreationDetails: AccountCreationDetails): Promise<Account>;
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
 * ================================
 * Utils Type / Interfaces
 * ================================
 */
export interface Account {
  accountId: string;
  accountStatus: AccountStatus;
  userProfile: UserProfile;
}

export enum AccountStatus {
  active,
  waitingConfirmation,
  disabled,
}

export interface UserProfile {}

export interface AccountCreationDetails {}

export interface ConfirmedAccount extends Account {}

export interface PendingAccountConfirmation {
  createdAccountId: string;
  token: Token;
}
