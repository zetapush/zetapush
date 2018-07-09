import { AccountStatusProvider, AccountStatus } from '../api';

export class StaticAccountStatusProvider implements AccountStatusProvider {
  constructor(private accountStatus: AccountStatus) {}

  async getStatus(): Promise<AccountStatus> {
    return this.accountStatus;
  }
}
