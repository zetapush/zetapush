import { EmailTemplateConfigurer, Configurer, TemplateConfigurer } from '../grammar';
import { TemplateManager, Location, Variables } from '../../api';
import { AbstractParent } from '../AbstractParent';
import { FuncCallTemplateParser } from '../../core';
import { NoOpResourceResolver, UndefinedLocation } from '../../core/resource/NoOpResourceResolver';
import { MissingMandatoryConfigurationError } from '../ConfigurerError';
import { DelegateTemplateManager } from '../../core/template/DelegateTemplateManager';

export class TemplateConfigurerImpl<P> extends AbstractParent<P>
  implements TemplateConfigurer<P>, Configurer<{ manager: TemplateManager; location: Location }> {
  protected parseFunc: (variables: Variables) => string;

  template(location: Location): EmailTemplateConfigurer<P>;
  template(func: (variables: Variables) => string): EmailTemplateConfigurer<P> {
    if (typeof func === 'function') {
      this.parseFunc = func;
    }
    throw new Error('Location not implemented');
  }

  async build() {
    let parser;
    let resolver;
    if (this.parseFunc) {
      parser = new FuncCallTemplateParser(this.parseFunc);
      resolver = new NoOpResourceResolver();
    }
    if (!parser) {
      throw new MissingMandatoryConfigurationError('No template parser configured');
    }
    if (!resolver) {
      throw new MissingMandatoryConfigurationError('No template resolver configured');
    }
    // TODO: handle location
    const manager = new DelegateTemplateManager(resolver, parser);
    return {
      manager,
      location: new UndefinedLocation()
    };
  }
}
