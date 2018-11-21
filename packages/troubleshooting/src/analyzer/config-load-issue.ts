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
    } else {
      return null;
    }
  }
}
