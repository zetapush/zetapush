// ZetaPush modules
import { trace } from '@zetapush/common';
// Project modules
import { ErrorAnalyzer, ErrorContextToAnalyze, ExitCode } from './error-analyzer';

export class ConfigLoadIssueAnalyzer extends ErrorAnalyzer {
  async getError(err: ErrorContextToAnalyze) {
    if (err.code === 'DIR_FRONT_MISSING') {
      return { code: ExitCode.CONFIG_03 };
    } else if (err.code === 'CONFIG_LOAD_ERROR') {
      return { code: ExitCode.CONFIG_01 };
    } else if (err.code === 'ZETARC_NOT_VALID') {
      return { code: ExitCode.CONFIG_02 };
    } else if (err.code === 'PACKAGE_JSON_MISSING') {
      return { code: ExitCode.CONFIG_04 };
    } else if (err.code === 'MAIN_PROPERTY_MISSING') {
      return { code: ExitCode.CONFIG_05 };
    } else if (err.code === 'WRONG_MAIN_PROPERTY') {
      return { code: ExitCode.CONFIG_06 };
    } else {
      trace('not config issue');
      return null;
    }
  }
}
