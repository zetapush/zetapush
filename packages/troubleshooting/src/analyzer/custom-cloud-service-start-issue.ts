// ZetaPush modules
import { trace } from '@zetapush/common';
// Project modules
import { ErrorAnalyzer, ErrorContextToAnalyze, ExitCode } from './error-analyzer';

export class CustomCloudServiceStartErrorAnalyzer extends ErrorAnalyzer {
  private hasWorkerStartNpmErr(progress: ErrorContextToAnalyze) {
    for (let log of progress.logs) {
      if (log.category == 'WORKER_START' && log.message.includes('npm ERR!')) {
        return true;
      }
    }
    return false;
  }

  private getWorkerStartLogs(progress: ErrorContextToAnalyze) {
    return progress.logs
      .filter((l: any) => l.category == 'WORKER_START')
      .map((l: any) => `${formatDate(l.timestamp)} [${l.level.name}] ${l.category.context || ''} ${l.message}`)
      .join('\n');
  }

  async getError(progress: ErrorContextToAnalyze) {
    if (!progress || !progress.logs) {
      trace('not custom cloud service start issue');
      return null;
    }
    if (this.hasWorkerStartNpmErr(progress)) {
      return { code: ExitCode.SERVICE_05, logs: this.getWorkerStartLogs(progress) };
    }
    trace('not custom cloud service start issue');
    return null;
  }
}

const formatDate = (ts: number) => {
  return new Date(ts).toISOString();
};

module.exports = { CustomCloudServiceStartErrorAnalyzer };
