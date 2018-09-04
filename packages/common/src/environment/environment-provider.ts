import { Environment } from '@zetapush/core';
import { defaultConfigurationPropertiesFactory } from './properties';
import { ResolvedConfig } from '../common-types';
import { defaultZetaPushContextFactory } from './context';
import { trace } from '../utils/log';

export interface EnvironmentProvider {
  get(): Promise<Environment>;
}

export class LocalDevEnvironmentProvider implements EnvironmentProvider {
  constructor(
    private config: ResolvedConfig,
    private envName: string,
    private confPath: string,
    private externalConfPath = process.env.CONFIG_PATH
  ) {}

  async get(): Promise<Environment> {
    trace('confPath', process.cwd() + '/' + this.confPath);
    trace('externalConfPath', this.externalConfPath);
    return {
      name: this.envName,
      context: await defaultZetaPushContextFactory(this.config),
      properties: await defaultConfigurationPropertiesFactory(this.envName, this.confPath, this.externalConfPath),
      variables: process.env
    };
  }
}
