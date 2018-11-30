import 'jasmine';
import { LocalOrPushedEnvironmentProvider, LocalDevEnvironmentProvider, PushedEnvironmentProvider } from '../../../src';
import { mock, instance, when, anything } from 'ts-mockito';
import { Environment, ZetaPushContext } from '@zetapush/core';

class MockedZetaPushContext implements ZetaPushContext {
  getAppName(): string {
    throw new Error('Method not implemented.');
  }
  getPlatformUrl(): string {
    throw new Error('Method not implemented.');
  }
  getFrontUrl(name?: string): string {
    throw new Error('Method not implemented.');
  }
  getWorkerUrl(name?: string, zetapushInternalServer?: boolean): string {
    throw new Error('Method not implemented.');
  }
  getLocalZetaPushHttpPort(): number {
    throw new Error('Method not implemented.');
  }
}

describe(`LocalOrPushedEnvironmentProvider()`, () => {
  beforeEach(async () => {
    this.localProvider = mock(LocalDevEnvironmentProvider);
    this.localEnv = mock(Environment);
    this.localContext = mock(MockedZetaPushContext);
    this.cloudProvider = mock(PushedEnvironmentProvider);
    this.cloudEnv = mock(Environment);
    this.cloudContext = mock(MockedZetaPushContext);
    when(this.localContext.getFrontUrl()).thenReturn('local-front-url');
    when(this.localEnv.context).thenReturn(instance(this.localContext));
    when(this.localProvider.get(anything(), anything())).thenReturn(instance(this.localEnv));
    when(this.cloudContext.getFrontUrl()).thenReturn('cloud-front-url');
    when(this.cloudEnv.context).thenReturn(instance(this.cloudContext));
    when(this.cloudProvider.get(anything(), anything())).thenReturn(instance(this.cloudEnv));
  });

  describe(`in local dev`, () => {
    beforeEach(async () => {
      process.env.ZETAPUSH_RUN_IN_CLOUD = '';
      this.provider = new LocalOrPushedEnvironmentProvider(instance(this.localProvider), instance(this.cloudProvider));
    });

    describe(`.get()`, () => {
      describe(`.context`, () => {
        describe(`.getFrontUrl()`, () => {
          it(`returns front url from local`, async () => {
            const { context } = await this.provider.get(null, null);
            expect(context.getFrontUrl()).toBe('local-front-url');
          });
        });
      });
    });
  });

  describe(`in cloud`, () => {
    beforeEach(async () => {
      process.env.ZETAPUSH_RUN_IN_CLOUD = 'true';
      this.provider = new LocalOrPushedEnvironmentProvider(instance(this.localProvider), instance(this.cloudProvider));
    });

    describe(`.get()`, () => {
      describe(`.context`, () => {
        describe(`.getFrontUrl()`, () => {
          it(`returns front url from cloud`, async () => {
            const { context } = await this.provider.get(null, null);
            expect(context.getFrontUrl()).toBe('cloud-front-url');
          });
        });
      });
    });
  });
});
