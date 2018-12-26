import 'jasmine';
import {
  defaultEnvironmentProvider,
  LocalOrPushedEnvironmentProvider,
  LocalDevEnvironmentProvider,
  PushedEnvironmentProvider,
  ResolvedConfig,
  ServerClient,
  LocalServerRegistry,
  CURRENT_WORKER_NAME
} from '../../../src';
import { mock, instance, when, anything } from 'ts-mockito';
import { Environment, ZetaPushContext } from '@zetapush/core';

class MockedClient {
  connect() {}
  createAsyncService() {}
}

class MockedQueue {
  getContext() {}
}

describe(`defaultEnvironmentProvider()`, () => {
  beforeEach(async () => {
    this.config = <ResolvedConfig>mock(<any>{});
    this.envName = 'dev';
    this.baseDir = '';
    this.client = mock(MockedClient);
    this.queueApi = mock(MockedQueue);
    this.contextResponse = mock(<any>{});
    this.registry = mock(LocalServerRegistry);
  });

  describe(`in local dev`, () => {
    beforeEach(async () => {
      process.env.ZETAPUSH_RUN_IN_CLOUD = '';
      this.provider = defaultEnvironmentProvider(
        instance(this.config),
        this.envName,
        this.baseDir,
        instance(this.registry)
      );
    });

    describe(`.get()`, () => {
      describe(`.context`, () => {
        describe(`using default names`, () => {
          beforeEach(async () => {
            when(this.registry.getServerInfo('front')).thenReturn({
              port: 3000
            });
            // FIXME: temporary hack until multiple workers are fully supported
            when(this.registry.getServerInfo('queue_0')).thenReturn({
              port: 2999
            });
          });
          describe(`.getFrontUrl()`, () => {
            describe(`without name`, () => {
              it(`returns default local front url`, async () => {
                const { context } = await this.provider.get(instance(this.client), instance(this.queueApi));
                expect(context.getFrontUrl()).toBe('http://localhost:3000');
              });
            });
            describe(`with unexisting name`, () => {
              it(`returns null`, async () => {
                const { context } = await this.provider.get(instance(this.client), instance(this.queueApi));
                expect(context.getFrontUrl('unexisting')).toBeNull();
              });
            });
          });
          describe(`.getWorkerUrl()`, () => {
            describe(`without name`, () => {
              it(`returns default local worker url`, async () => {
                const { context } = await this.provider.get(instance(this.client), instance(this.queueApi));
                expect(context.getWorkerUrl()).toBe('http://localhost:2999');
              });
            });
            describe(`with unexisting name`, () => {
              it(`returns null`, async () => {
                const { context } = await this.provider.get(instance(this.client), instance(this.queueApi));
                expect(context.getWorkerUrl('unexisting')).toBeNull();
              });
            });
          });
        });

        describe(`using custom names`, () => {
          beforeEach(async () => {
            when(this.registry.getServerInfo('foo')).thenReturn({
              port: 3000
            });
            when(this.registry.getServerInfo('bar')).thenReturn({
              port: 2999
            });
          });
          describe(`.getFrontUrl()`, () => {
            describe(`using existing custom name`, () => {
              it(`returns front url from local`, async () => {
                const { context } = await this.provider.get(instance(this.client), instance(this.queueApi));
                expect(context.getFrontUrl('foo')).toBe('http://localhost:3000');
              });
            });
            describe(`using unexisting custom name`, () => {
              it(`returns null`, async () => {
                const { context } = await this.provider.get(instance(this.client), instance(this.queueApi));
                expect(context.getFrontUrl('unexisting')).toBeNull();
              });
            });
          });
          describe(`.getWorkerUrl()`, () => {
            describe(`using existing custom name`, () => {
              it(`returns front url from local`, async () => {
                const { context } = await this.provider.get(instance(this.client), instance(this.queueApi));
                expect(context.getWorkerUrl('bar')).toBe('http://localhost:2999');
              });
            });
            describe(`using unexisting custom name`, () => {
              it(`returns null`, async () => {
                const { context } = await this.provider.get(instance(this.client), instance(this.queueApi));
                expect(context.getFrontUrl('unexisting')).toBeNull();
              });
            });
          });
        });
      });
    });
  });

  describe(`in cloud`, () => {
    beforeEach(async () => {
      process.env.ZETAPUSH_RUN_IN_CLOUD = 'true';
      this.provider = defaultEnvironmentProvider(
        instance(this.config),
        this.envName,
        this.baseDir,
        instance(this.registry)
      );
    });

    describe(`.get()`, () => {
      describe(`.context`, () => {
        describe(`using default names`, () => {
          describe(`.getFrontUrl()`, () => {
            describe(`with correct platform response`, () => {
              beforeEach(async () => {
                when(this.contextResponse.fronts).thenReturn({
                  front: {
                    urls: { HOSTED: 'http://10.0.0.1/front', USER_FRIENDLY: 'http://front.zetapush.app' }
                  }
                });
                when(this.queueApi.getContext()).thenResolve(instance(this.contextResponse));
              });
              describe(`without name`, () => {
                it(`returns front url from cloud`, async () => {
                  const { context } = await this.provider.get(instance(this.client), instance(this.queueApi));
                  expect(context.getFrontUrl()).toBe('http://front.zetapush.app');
                });
              });
              describe(`with unexisting name`, () => {
                it(`returns null`, async () => {
                  const { context } = await this.provider.get(instance(this.client), instance(this.queueApi));
                  expect(context.getFrontUrl('unexisting')).toBeNull();
                });
              });
            });
          });
          describe(`.getWorkerUrl()`, () => {
            describe(`with correct platform response`, () => {
              beforeEach(async () => {
                when(this.contextResponse.workers).thenReturn({
                  // FIXME: temporary hack until multiple workers are fully supported
                  queue_0: {
                    urls: { HOSTED: 'http://10.0.0.1/worker', USER_FRIENDLY: 'http://worker.zetapush.app' }
                  }
                });
                when(this.queueApi.getContext()).thenResolve(instance(this.contextResponse));
              });
              describe(`without name`, () => {
                it(`returns default worker url from cloud`, async () => {
                  const { context } = await this.provider.get(instance(this.client), instance(this.queueApi));
                  expect(context.getWorkerUrl()).toBe('http://worker.zetapush.app');
                });
              });
              describe(`with unexisting name`, () => {
                it(`returns null`, async () => {
                  const { context } = await this.provider.get(instance(this.client), instance(this.queueApi));
                  expect(context.getWorkerUrl('unexisting')).toBeNull();
                });
              });
              describe(`with default name and internal server`, () => {
                it(`returns worker url from cloud for internal server`, async () => {
                  const { context } = await this.provider.get(instance(this.client), instance(this.queueApi));
                  expect(context.getWorkerUrl(CURRENT_WORKER_NAME, true)).toBe('http://worker.zetapush.app/@zetapush');
                });
              });
            });
          });
        });
      });
    });
  });
});
