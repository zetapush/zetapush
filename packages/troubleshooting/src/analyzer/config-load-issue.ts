// ZetaPush modules
import { trace } from '@zetapush/common';
// Project modules
import { ErrorAnalyzer, ErrorContextToAnalyze, ExitCode } from './error-analyzer';

export class ConfigLoadIssueAnalyzer extends ErrorAnalyzer {
  async getError(err: ErrorContextToAnalyze) {
    if (err.code != 'CONFIG_LOAD_ERROR') {
      trace('not config issue');
      return null;
    }
    return { code: ExitCode.CONFIG_01 };
  }
}
