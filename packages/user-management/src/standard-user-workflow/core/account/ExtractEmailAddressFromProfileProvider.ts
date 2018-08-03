import { EmailAddressProvider, Account } from '../../api';
import { EmailAddressWrapper } from '../../../common/core';

export class ExtractEmailAddressFromProfileProvider implements EmailAddressProvider {
  async getEmailAddress(account: Account) {
    return new EmailAddressWrapper(account.userProfile.email);
  }
}
