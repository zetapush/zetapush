import { Variables, VariablesProvider } from '../../api';
import { ConfigurationProperties, ZetaPushContext } from '../../configurer';

export class VariablesWithContextProvider implements VariablesProvider {
  constructor(private properties: ConfigurationProperties, private zetapushContext: ZetaPushContext) {}

  async getVariables(variables?: Variables): Promise<Variables> {
    return {
      ...variables,
      properties: this.properties,
      zetapushContext: this.zetapushContext
    };
  }
}
