import { Context } from './Context';

export interface Cleanable {
  onApplicationCleanup(context?: Context): Promise<any>;
}
