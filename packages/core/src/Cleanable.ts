import { RequestContext } from './Context';

export interface Cleanable {
  onApplicationCleanup(context?: RequestContext): Promise<any>;
}
