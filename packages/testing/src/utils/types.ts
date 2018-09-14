import { Config } from '@zetapush/common';
import { Runner } from './commands';
import { Provider, InjectionToken, Module } from '@zetapush/core';
import { WorkerRunner } from '@zetapush/worker';

// export type ConfigurationFunction = (...dependencies: any[]) => Promise<Provider[] | null>;
export type Dependencies = Array<Function | InjectionToken<any>> | (() => Array<Function | InjectionToken<any>>);
export interface TestContext {
  zetarc: Config;
  projectDir?: string;
  processLocalRegistry?: string;
  runner?: Runner;
  workerRunner?: WorkerRunner;
  moduleDeclaration?: () => Promise<Module>;
  dependencies?: Dependencies;
  // providers?: Provider[];
  logLevel: {
    cometd: 'info' | 'debug' | 'warn';
    winston: 'silly' | 'verbose' | 'debug' | 'info' | 'warn' | 'error';
    cli: number;
  };
  // configurationFunction?: ConfigurationFunction;
}

export interface Test {
  context: TestContext;
}

export class ContextWrapper {
  constructor(public testOrContext: Context) {}

  getContext(): TestContext {
    if ((<Test>this.testOrContext).context) {
      return (<Test>this.testOrContext).context;
    }
    return <TestContext>this.testOrContext;
  }
}

export type Context = TestContext | Test | any;
