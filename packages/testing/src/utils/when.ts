export const userAction = async (name, func) => {
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

export const consoleUserAction = async (name, func) => {
  return await userAction(name + ' from console', func);
};

export const frontUserAction = async (name, testOrContext, func) => {
  return await userAction(name + ' from front', async () => {
    let api;
    let client;
    try {
      const zetarc = testOrContext.zetarc || testOrContext.context.zetarc;
      client = new WeakClient({
        ...zetarc,
        transports,
      });
      frontUserActionLogger.debug('Connecting to worker...');
      await client.connect();
      frontUserActionLogger.debug('Connected to worker');
      api = client.createProxyTaskService();
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
        testOrContext.context || testOrContext,
        e,
      );
      throw e;
    }
  });
};
