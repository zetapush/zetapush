import { TestContext, Test, ContextWrapper, Context } from '../utils/types';
import { cleanLogger } from '../utils/logger';
import { nukeApp, nukeProject } from '../utils/commands';
import { ResolvedConfig } from '@zetapush/common';

export const autoclean = async (testOrContext: Context) => {
  const context = new ContextWrapper(testOrContext).getContext();
  if (context && context.workerRunner) {
    try {
      cleanLogger.warn('destroying worker...');
      await context.workerRunner.destroy();
    } catch (e) {
      cleanLogger.warn('Failed to autoclean (destroy worker). Skipping the error.', e);
    }
  }
  if (context && context.runner) {
    try {
      cleanLogger.warn('stopping worker...');
      await context.runner.stop();
    } catch (e) {
      cleanLogger.warn('Failed to autoclean (destroy worker). Skipping the error.', e);
    }
  }
  if (context && context.projectDir) {
    try {
      cleanLogger.warn('nuking project...', context.projectDir);
      await nukeProject(context.projectDir);
    } catch (e) {
      cleanLogger.warn('Failed to autoclean (nukeProject). Skipping the error.', e);
    }
  } else if (context && context.zetarc) {
    try {
      cleanLogger.warn('nuking app...', context.zetarc);
      await nukeApp(<ResolvedConfig>context.zetarc);
    } catch (e) {
      cleanLogger.warn('Failed to autoclean (nukeApp). Skipping the error.', e);
    }
  } else {
    cleanLogger.debug('Skipping autoclean (nukeProject and nukeApp).', testOrContext);
  }
};
