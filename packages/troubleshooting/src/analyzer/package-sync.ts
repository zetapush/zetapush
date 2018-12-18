// ZetaPush modules
import { trace } from '@zetapush/common';
// Project modules
import { ErrorAnalyzer, ErrorContextToAnalyze, ExitCode } from './error-analyzer';

export class PackageSyncErrorAnalyser extends ErrorAnalyzer {
  async getError(error: ErrorContextToAnalyze) {
    if (error && error.code === 'PACKAGE_LOCK_OUT_OF_SYNC') {
      trace('npm package-lock out of sync');
      return { code: ExitCode.PACKAGE_SYNC_01 };
    }
    return null;
  }
}
