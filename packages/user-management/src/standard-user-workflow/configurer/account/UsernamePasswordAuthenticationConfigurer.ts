import {
  LoginConfigurer,
  Configurer,
  StandardUserWorkflowConfigurer,
  FieldsConfigurer,
  AccountConfigurer
} from '../../../../src/common/configurer/grammar';
import { AbstractParent } from '../../../../src/common/configurer/AbstractParent';
import { AuthenticationManager } from '../../../../src/standard-user-workflow/api/Authentication';
import { UsernamePasswordAuthenticationManager } from '../../core/login/UsernamePasswordAuthenticationManager';
import { Simple } from '@zetapush/platform-legacy';
import { Client } from '@zetapush/client';

export class UsernamePasswordAuthenticationConfigurer extends AbstractParent<AccountConfigurer>
  implements LoginConfigurer, Configurer<AuthenticationManager> {
  constructor(parentConfigurer: AccountConfigurer, private auth: Simple, private client: Client) {
    super(parentConfigurer);
  }

  fields(): FieldsConfigurer<LoginConfigurer> {
    // TODO:
    throw new Error('Method not implemented.');
  }

  async build(): Promise<AuthenticationManager> {
    return new UsernamePasswordAuthenticationManager(this.client, this.auth);
  }
}
