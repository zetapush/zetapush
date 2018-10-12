import { Environment } from '@zetapush/core';
import { ServerClient } from '../common-types';

export interface EnvironmentProvider {
  get(client: ServerClient, queueApi: any): Promise<Environment>;
}
