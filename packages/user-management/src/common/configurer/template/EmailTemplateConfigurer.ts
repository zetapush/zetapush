import { EmailTemplateConfigurer } from '../grammar';
import { TemplateConfigurerImpl } from './TemplateConfigurer';
import { Configurer, Scope } from '../Configurer';

export class EmailTemplateConfigurerImpl<P> extends TemplateConfigurerImpl<P, EmailTemplateConfigurer<P>>
  implements EmailTemplateConfigurer<P>, Configurer {
  constructor(parent: P, scope: Scope) {
    super(parent, scope);
    this.self = this;
  }

  inlineCss(): EmailTemplateConfigurer<P> {
    throw new Error('Method not implemented.');
  }
  inlineImages(): EmailTemplateConfigurer<P> {
    throw new Error('Method not implemented.');
  }

  async getProviders() {
    return super.getProviders();
  }
}
