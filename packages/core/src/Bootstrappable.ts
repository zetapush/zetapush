import { RequestContext } from './Context';

export interface Bootstrappable {
  onApplicationBootstrap(context?: RequestContext): Promise<any>;
}
