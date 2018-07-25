import { userActionLogger, frontUserActionLogger } from '../utils/logger';
import { WeakClient } from '@zetapush/client';
import { Test, TestContext, Context, ContextWrapper } from '../utils/types';
const transports = require('@zetapush/cometd/lib/node/Transports');

export const userAction = async (name: string, func: () => any) => {
  try {
    userActionLogger.info(`>>> User action: ${name}`);
    const res = await func();
    userActionLogger.info(`>>> User action DONE: ${name}`);
    return res;
  } catch (e) {
    userActionLogger.error(`>>> User action FAILED: ${name}`, e);
    throw e;
  }
};

export const consoleUserAction = async (name: string, func: () => any) => {
  return await userAction(name + ' from console', func);
};

export const frontUserAction = async (
  name: string,
  testOrContext: Context,
  func: (api: any, client: WeakClient) => any,
) => {
  return await userAction(name + ' from front', async () => {
    let api;
    let client;
    try {
      const zetarc = new ContextWrapper(testOrContext).getContext().zetarc;
      client = new WeakClient({
        ...(<any>zetarc),
        transports,
      });
      frontUserActionLogger.debug('Connecting to worker...');
      await client.connect();
      frontUserActionLogger.debug('Connected to worker');
      api = (<any>client).createProxyTaskService();
      frontUserActionLogger.debug('Api instance created');
    } catch (e) {
      frontUserActionLogger.error(
        "Connection from client failed. Cloud service won't be called",
        e,
      );
      throw e;
    }
    try {
      return await func(api, client);
    } catch (e) {
      frontUserActionLogger.error(
        `>>> Front user action FAILED: ${name}`,
        new ContextWrapper(testOrContext).getContext(),
        e,
      );
      throw e;
    }
  });
};
