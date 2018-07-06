import { Credentials, Account } from './index';

export interface AuthenticationManager {
  login(credentials: Credentials): Account;
  logout();
}
