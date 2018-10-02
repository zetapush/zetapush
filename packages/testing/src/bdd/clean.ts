import { TestContext, Test, ContextWrapper, Context } from '../utils/types';
import { cleanLogger } from '../utils/logger';
import { nukeApp, nukeProject } from '../utils/commands';
import { ResolvedConfig } from '@zetapush/common';
const execa = require('execa');
const kill = require('tree-kill');

export const autoclean = async (testOrContext: Context, disableResetNpmRegistry = false) => {
  const context = new ContextWrapper(testOrContext).getContext();

  // Reset the npm registry to 'https://registry.npmjs.org' (can be changed during testing, reset to default)
  await execa.shell('npm config set registry https://registry.npmjs.org');

  // Kill subprocess for local npm registry
  if (context.processLocalRegistry) {
    kill(context.processLocalRegistry, 'SIGTERM');
  }

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
