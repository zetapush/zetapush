import { AccountStatusProvider, AccountStatus } from '../../api';

export class StaticAccountStatusProvider implements AccountStatusProvider {
  constructor(protected accountStatus: AccountStatus) {}

  async getStatus(): Promise<AccountStatus> {
    return this.accountStatus;
  }
}
