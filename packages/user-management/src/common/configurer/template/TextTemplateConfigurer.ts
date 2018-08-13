import { TextTemplateConfigurer, Configurer } from '../grammar';
import { AbstractParent } from '../AbstractParent';
import { Location, Variables, TemplateManager } from '../../api';
import { FuncCallTemplateParser } from '../../core';
import { DelegateTemplateManager } from '../../core/template/DelegateTemplateManager';
import { NoOpResourceResolver } from '../../core/resource/NoOpResourceResolver';
import { MissingMandatoryConfigurationError } from '../ConfigurerError';
import { TemplateConfigurerImpl } from './TemplateConfigurer';

export class TextTemplateConfigurerImpl<P> extends TemplateConfigurerImpl<P, TextTemplateConfigurer<P>>
  implements TextTemplateConfigurer<P>, Configurer<{ manager: TemplateManager; location?: Location }> {
  constructor(parent: P) {
    super(parent);
    this.self = this;
  }

  async build() {
    return super.build();
  }
}
