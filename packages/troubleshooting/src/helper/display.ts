// ZetaPush modules
import { debugObject, error, help, info, trace, warn } from '@zetapush/common';
// Project modules
import { ErrorHelper } from './error-helper';
import { ErrorAnalyzer, ErrorContextToAnalyze, ErrorAnalyzerResult } from '../analyzer/error-analyzer';
import { EXIT_CODES } from '../utils/constants';
import { evaluate } from '../utils/evaluate';
// ThirdPart modules
const chalk = require('chalk');
const chalkTpl = require('chalk/templates');
const ora = require('ora');

export const displayHelp = async (errorCtxt: ErrorContextToAnalyze) => {
  debugObject('displayHelp', { errorCtxt });
  const spinner = ora('Analyzing the error to provide you useful help... \n');
  try {
    spinner.start();
    let analyzedError = await ErrorAnalyzer.analyze(errorCtxt);
    spinner.stop();
    if (analyzedError) {
      trace(`Analyze done => errorCode=${analyzedError.code}. Displaying help for this code`);
      await displayHelpMessage(analyzedError);
      // FIXME: remove noise from npm
      process.exit(EXIT_CODES[analyzedError.code] || 254);
      // process.exit(0);
    } else {
      info('No help available');
      error('original error', errorCtxt);
      process.exit(253);
    }
  } catch (e) {
    spinner.stop();
    warn('Failed to analyze error to provide useful help. Please report bug', e);
  }
};

export const displayHelpMessage = async (error: ErrorAnalyzerResult) => {
  try {
    trace(`Display help message for ${error.code}`);
    const instance = ErrorHelper.getInstance();

    console.log('==> instance : ', instance);

    if (instance !== null) {
      let helpMessage = await instance.getHelp(error);
      help(chalkTpl(chalk, evaluate(helpMessage, error)));
    }
  } catch (e) {
    warn('Failed to display help message. Please report bug', e);
  }
};
