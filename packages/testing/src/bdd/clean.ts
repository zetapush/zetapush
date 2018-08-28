import { TestContext, Test, ContextWrapper, Context } from '../utils/types';
import { cleanLogger } from '../utils/logger';
import { nukeApp, nukeProject } from '../utils/commands';
import { ResolvedConfig } from '@zetapush/common';

export const autoclean = async (testOrContext: Context) => {
  const context = new ContextWrapper(testOrContext).getContext();
  if (context && context.workerRunner) {
    try {
      await context.workerRunner.destroy();
    } catch (e) {
      cleanLogger.warn('Failed to autoclean (destroy worker). Skipping the error.', e);
    }
  }
  if (context && context.projectDir) {
    try {
      return await nukeProject(context.projectDir);
    } catch (e) {
      cleanLogger.warn('Failed to autoclean (nukeProject). Skipping the error.', e);
    }
  } else if (context && context.zetarc) {
    try {
      return await nukeApp(<ResolvedConfig>context.zetarc);
    } catch (e) {
      cleanLogger.warn('Failed to autoclean (nukeApp). Skipping the error.', e);
    }
  } else {
    cleanLogger.debug('Skipping autoclean (nukeProject and nukeApp).', testOrContext);
  }
};
