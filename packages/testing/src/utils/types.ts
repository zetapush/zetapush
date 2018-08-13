import { Config } from '@zetapush/common';
import { Runner } from './commands';

export interface TestContext {
  zetarc: Config;
  projectDir?: string;
  runner?: Runner;
  dependencies?: Function[];
  logLevel: {
    cometd: 'info' | 'debug' | 'warn';
    winston: 'silly' | 'verbose' | 'debug' | 'info' | 'warn' | 'error';
    cli: number;
  };
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
