import { Credentials, Account } from '.';
export interface AuthenticationManager {
  login(credentials: Credentials): Promise<Account>;
  logout(): void;
}
export abstract class AuthenticationManagerInjectable implements AuthenticationManager {
  abstract login(credentials: Credentials): Promise<Account>;
  abstract logout(): void;
}
