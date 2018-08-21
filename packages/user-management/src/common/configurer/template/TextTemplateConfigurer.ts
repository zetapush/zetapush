import { TextTemplateConfigurer } from '../grammar';
import { AbstractParent } from '../AbstractParent';
import { Location, Variables, TemplateManager } from '../../api';
import { FuncCallTemplateParser } from '../../core';
import { DelegateTemplateManager } from '../../core/template/DelegateTemplateManager';
import { NoOpResourceResolver } from '../../core/resource/NoOpResourceResolver';
import { MissingMandatoryConfigurationError } from '../ConfigurerError';
import { TemplateConfigurerImpl } from './TemplateConfigurer';
import { Configurer, Scope } from '../Configurer';

export class TextTemplateConfigurerImpl<P> extends TemplateConfigurerImpl<P, TextTemplateConfigurer<P>>
  implements TextTemplateConfigurer<P>, Configurer {
  constructor(parent: P, scope: Scope) {
    super(parent, scope);
    this.self = this;
  }

  async getProviders() {
    return super.getProviders();
  }
}
