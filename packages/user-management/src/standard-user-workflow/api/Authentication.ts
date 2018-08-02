import { Credentials, Account } from '.';

export interface AuthenticationManager {
  login(credentials: Credentials): Promise<Account>;
  logout(): Promise<Account>;
}
