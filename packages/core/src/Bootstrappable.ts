import { Context } from './Context';

export interface Bootstrappable {
  onApplicationBootstrap(context?: Context): Promise<any>;
}

export class BootstrapRegistry {
  private entries: any[] = [];

  register(bootstrappable: any) {
    this.entries.push(bootstrappable);
  }

  getInstances() {
    return this.entries;
  }

  clear() {
    this.entries = [];
  }
}

export const bootstrapRegistry = new BootstrapRegistry();

export interface BootstrappableOptions {
  registry?: BootstrapRegistry;
}

export function Bootstrappable(options: BootstrappableOptions = { registry: bootstrapRegistry }) {
  return function<T extends { new (...args: any[]): {} }>(target: T) {
    return class extends target {
      constructor(...args: any[]) {
        super(...args);
        (options.registry || bootstrapRegistry).register(this);
      }
    };
  };
}
