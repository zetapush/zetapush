import { TestContext, Test, ContextWrapper, Context } from '../utils/types';
import { cleanLogger } from '../utils/logger';
import { nukeApp } from '../utils/commands';

export const autoclean = async (testOrContext: Context) => {
  const context = new ContextWrapper(testOrContext).getContext();
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
