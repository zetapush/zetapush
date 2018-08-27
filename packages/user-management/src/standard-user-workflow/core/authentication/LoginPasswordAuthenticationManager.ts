import { AuthenticationManager } from '../../api/Authentication';
import { Account } from '../../api/Account';
import { LoginPasswordCredentials } from '../../api/Credentials';
import { Client } from '@zetapush/client';
import { Simple } from '@zetapush/platform-legacy';
import { FailedGetUserProfileError } from '../exceptions/AccountAuthenticationError';

export class LoginPasswordAuthenticationManager implements AuthenticationManager {
  constructor(private authService: Simple) {}

  async login(credentials: LoginPasswordCredentials): Promise<Account> {
    // try {
    //   await client.connect(credentials);
    // } catch(e) {
    //   // TODO: Handle the bad credentials error
    // }

    // let user;
    // try {
    //   user = await this.authService.checkUser({ key: credentials.login });
    // } catch (err) {
    //   throw new FailedGetUserProfileError(`The service failed to get the user profile`);
    // }

    // return user as Account;

    throw 'Method not implemented';
  }

  logout(): void {
    // client.disconnect();
  }
}
