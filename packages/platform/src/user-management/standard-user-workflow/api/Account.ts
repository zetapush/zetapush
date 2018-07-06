export interface Account {
  accountStatus: AccountStatus;
  accountDetails: AccountDetails;
  userProfile: UserProfile;
}

export enum AccountStatus {
  active,
  waitingConfirmation,
  disabled,
}

export interface AccountDetails {
  accountId: string;
}

export interface UserProfile {
  accountId: string;
}

export interface AccountCreationDetails {}
