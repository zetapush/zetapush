import { AccountStatus, Credentials, UserProfile, Account } from '../../standard-user-workflow/api';

export interface UserRepository {
  exists(credentials: Credentials): Promise<boolean>;

  addUser(
    credentials: Credentials,
    userProfile: UserProfile,
    accountStatus: AccountStatus,
    accountId?: string
  ): Promise<Account>;

  getProfile(accountId: string): Promise<UserProfile>;

  updateStatus(accountId: string, newStatus: AccountStatus): Promise<void>;

  getAccountFromLogin(login: string): Promise<Account>;

  getAccountFromAccountId(accountId: string): Promise<Account>;

  getLoginFromAccountId(accountId: string): Promise<string>;

  getUserKey(accountId: string): Promise<string>;
}

export abstract class UserRepositoryInjectable implements UserRepository {
  abstract exists(credentials: Credentials): Promise<boolean>;

  abstract addUser(
    credentials: Credentials,
    userProfile: UserProfile,
    accountStatus: AccountStatus,
    accountId?: string
  ): Promise<Account>;

  abstract getProfile(accountId: string): Promise<UserProfile>;

  abstract updateStatus(accountId: string, newStatus: AccountStatus): Promise<void>;

  abstract getAccountFromLogin(login: string): Promise<Account>;

  abstract getAccountFromAccountId(accountId: string): Promise<Account>;

  abstract getLoginFromAccountId(accountId: string): Promise<string>;

  abstract getUserKey(accountId: string): Promise<string>;
}
