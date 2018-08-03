// Project modules
import { ErrorAnalyzer, ErrorContextToAnalyze, ExitCode } from './error-analyzer';
export class OnApplicationBoostrapErrorAnalyser extends ErrorAnalyzer {
  async getError(err: ErrorContextToAnalyze) {
    // RUN LOCAL
    if (err.code === 'EBOOTFAIL') {
      err.code = ExitCode.BOOTSTRAP_01;
      return err;
    }
    // PUSH
    for (let step of err.steps) {
      for (let error of step.errors) {
        if (error.cause.code === 'EBOOTFAIL') {
          return {
            code: ExitCode.BOOTSTRAP_01,
            message: error.message
          };
        }
      }
    }
    return null;
  }
}
