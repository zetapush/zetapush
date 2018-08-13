import { EmailTemplateConfigurer, Configurer, TemplateConfigurer } from '../grammar';
import { TemplateManager, Location, Variables } from '../../api';
import { AbstractParent } from '../AbstractParent';
import { FuncCallTemplateParser } from '../../core';
import { NoOpResourceResolver, UndefinedLocation } from '../../core/resource/NoOpResourceResolver';
import { MissingMandatoryConfigurationError } from '../ConfigurerError';
import { DelegateTemplateManager } from '../../core/template/DelegateTemplateManager';

export abstract class TemplateConfigurerImpl<P, S extends TemplateConfigurer<P, S>> extends AbstractParent<P>
  implements TemplateConfigurer<P, S>, Configurer<{ manager: TemplateManager; location: Location }> {
  protected self: S;
  protected parseFunc: (variables: Variables) => string;

  constructor(parent: P) {
    super(parent);
  }

  template(location: Location): S;
  template(func: (variables: Variables) => string): S {
    if (typeof func === 'function') {
      this.parseFunc = func;
      return this.self;
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
