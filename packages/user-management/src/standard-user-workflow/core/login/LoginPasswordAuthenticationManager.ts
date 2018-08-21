import { AuthenticationManager } from '../../api/Authentication';
import { Account } from '../../api/Account';
import { LoginPasswordCredentials } from '../../api/Credentials';
import { Client } from '@zetapush/client';
import { Simple } from '@zetapush/platform-legacy';
import { FailedGetUserProfileError } from '../exceptions/AccountAuthenticationError';

export class LoginPasswordAuthenticationManager implements AuthenticationManager {
  constructor(private client: Client, private authService: Simple) {}

  async login(credentials: LoginPasswordCredentials): Promise<Account> {
    await this.client.connect();

    return new Promise<Account>(async (resolve, reject) => {
      const userId = this.client.getUserId();
      let userAccount;
      try {
        userAccount = await this.authService.checkUser({
          key: userId
        });
      } catch (err) {
        reject(new FailedGetUserProfileError(`The service failed to get the user profile`, userId));
      }
      resolve(userAccount as Account);
    });
  }

  logout(): void {
    this.client.disconnect();
  }
}
