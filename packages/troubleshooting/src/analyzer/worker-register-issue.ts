// ZetaPush modules
import { info, trace } from '@zetapush/common';
// Project modules
import { ErrorAnalyzer, ErrorContextToAnalyze, ExitCode } from './error-analyzer';

export class WorkerRegisterErrorAnalyser extends ErrorAnalyzer {
  async getError(err: ErrorContextToAnalyze) {
    if (err.code != 'WORKER_INSTANCE_REGISTER_FAILED') {
      trace('not worker register issue');
      return null;
    }
    return { code: ExitCode.WORKER_REGISTER_01 };
  }
}
