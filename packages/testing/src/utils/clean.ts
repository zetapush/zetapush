const { nukeApp } = require('./commands');

export const autoclean = async (testOrContext) => {
  const context = testOrContext.projectDir
    ? testOrContext
    : testOrContext.context;
  if (context && context.projectDir) {
    try {
      return await nukeApp(context.projectDir);
    } catch (e) {
      cleanLogger.warn('Failed to autoclean (nukeApp). Skipping the error.', e);
    }
  } else {
    cleanLogger.debug('Skipping autoclean (nukeApp).', testOrContext);
  }
};
