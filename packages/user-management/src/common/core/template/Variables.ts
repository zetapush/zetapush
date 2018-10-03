import { Variables, VariablesProvider } from '../../api';
import { ConfigurationProperties, ZetaPushContext } from '@zetapush/core';

export interface VariablesWithContext extends Variables {
  readonly properties: ConfigurationProperties;
  readonly zetapushContext: ZetaPushContext;
}

export class VariablesWithContextProvider<T extends VariablesWithContext> implements VariablesProvider<T> {
  constructor(protected properties: ConfigurationProperties, protected zetapushContext: ZetaPushContext) {}

  async getVariables(variables?: Variables): Promise<T> {
    return {
      ...(variables || {}),
      properties: this.properties,
      zetapushContext: this.zetapushContext
    } as T;
  }
}
