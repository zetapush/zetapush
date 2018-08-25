import { EmailTemplateConfigurer, TemplateConfigurer } from '../grammar';
import {
  TemplateManager,
  Location,
  Variables,
  TemplateParseError,
  TemplateParserInjectable,
  TemplateManagerInjectable,
  ResourceResolverInjectable,
  ResourceResolver,
  TemplateParser
} from '../../api';
import { AbstractParent } from '../AbstractParent';
import { FuncCallTemplateParser } from '../../core';
import { NoOpResourceResolver, UndefinedLocation } from '../../core/resource/NoOpResourceResolver';
import { MissingMandatoryConfigurationError } from '../ConfigurerError';
import { DelegateTemplateManager } from '../../core/template/DelegateTemplateManager';
import { Configurer, Scope, scoped, SimpleProviderRegistry, scopedDependency } from '../Configurer';

export abstract class TemplateConfigurerImpl<P, S extends TemplateConfigurer<P, S>> extends AbstractParent<P>
  implements TemplateConfigurer<P, S>, Configurer {
  protected self: S;
  protected parseFunc: (variables: Variables) => string;

  constructor(parent: P, private scope: Scope) {
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

  async getProviders() {
    let providerRegistry = new SimpleProviderRegistry();

    if (this.parseFunc) {
      // FIXME: use scope too ?
      providerRegistry.registerFactory(
        scoped(this.scope, TemplateParserInjectable),
        [],
        () => new FuncCallTemplateParser(this.parseFunc)
      );
      providerRegistry.registerClass(scoped(this.scope, ResourceResolverInjectable), NoOpResourceResolver);
    }

    providerRegistry.registerFactory(
      scoped(this.scope, TemplateManagerInjectable),
      [
        scopedDependency(this.scope, ResourceResolverInjectable),
        scopedDependency(this.scope, TemplateParserInjectable)
      ],
      (resourceResolver: ResourceResolver, templateParser: TemplateParser) =>
        new DelegateTemplateManager(resourceResolver, templateParser)
    );

    return providerRegistry.getProviders();
  }
}
