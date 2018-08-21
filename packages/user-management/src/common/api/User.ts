import { AccountStatus, Credentials, UserProfile } from '../../standard-user-workflow/api';

export interface UserRepository {
  exists(credentials: Credentials): Promise<boolean>;

  addUser(
    credentials: Credentials,
    userProfile: UserProfile,
    accountStatus: AccountStatus,
    accountId?: string
  ): Promise<string>;

  getProfile(accountId: string): Promise<UserProfile>;

  updateStatus(accountId: string, newStatus: AccountStatus): Promise<void>;
}

export abstract class UserRepositoryInjectable implements UserRepository {
  abstract exists(credentials: Credentials): Promise<boolean>;

  abstract addUser(
    credentials: Credentials,
    userProfile: UserProfile,
    accountStatus: AccountStatus,
    accountId?: string
  ): Promise<string>;

  abstract getProfile(accountId: string): Promise<UserProfile>;

  abstract updateStatus(accountId: string, newStatus: AccountStatus): Promise<void>;
}
