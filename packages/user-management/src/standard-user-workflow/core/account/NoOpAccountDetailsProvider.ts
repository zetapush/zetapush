import { AccountDetailsProvider, UserProfile } from '../../api';

export class NoOpAccountDetailsProvider implements AccountDetailsProvider {
  async getUserProfile(original: any): Promise<UserProfile> {
    return original;
  }
}
