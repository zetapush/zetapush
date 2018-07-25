import { Config } from '@zetapush/common';
import { Runner } from './commands';

export interface TestContext {
  zetarc: Config;
  projectDir?: string;
  runner?: Runner;
}

// export class TestContext {
//   constructor(
//     public zetarc: Config,
//     public projectDir?: string,
//     public runner?: Runner,
//   ) {}

//   getContext(): TestContext {
//     return this;
//   }
// }

export interface Test {
  context: TestContext;
}

// export class Test {
//   constructor(public context: TestContext) {}

//   getContext(): TestContext {
//     return this.context;
//   }
// }

export class ContextWrapper {
  constructor(public testOrContext: Context) {}

  getContext(): TestContext {
    // if (
    //   this.testOrContext instanceof Test ||
    //   this.testOrContext instanceof TestContext
    // ) {
    //   return this.testOrContext.getContext();
    // }
    if ((<Test>this.testOrContext).context) {
      return (<Test>this.testOrContext).context;
    }
    return <TestContext>this.testOrContext;
  }
}

export type Context = TestContext | Test;
