import { Context } from './Context';

export interface Bootstrapable {
  onApplicationBootstrap(context?: Context): Promise<any>;
}
