import { Account } from './Account';
import { Token, Variables } from '../../common/api';
import { ConfigurationProperties, ZetaPushContext } from '../../common/configurer';

export interface AccountConfirmationContext extends Variables {
  readonly account: Account;
  readonly token: Token;
  readonly properties: ConfigurationProperties;
  readonly zetapushContext: ZetaPushContext;
}

export interface ConfirmationUrlProvider {
  getUrl(context: AccountConfirmationContext): Promise<string>;
}
export abstract class ConfirmationUrlProviderInjectable {
  abstract getUrl(context: AccountConfirmationContext): Promise<string>;
}
