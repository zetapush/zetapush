import { Context } from './Context';

export interface Bootstrappable {
  onApplicationBootstrap(context?: Context): Promise<any>;
}
