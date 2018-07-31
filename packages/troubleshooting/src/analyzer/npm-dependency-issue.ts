// ZetaPush modules
import { trace } from '@zetapush/common';
// Project modules
import { ErrorAnalyzer, ErrorContextToAnalyze, ExitCode } from './error-analyzer';

export class MissingNpmDependencyErrorAnalyzer extends ErrorAnalyzer {
  hasNpmInstallFailed(progress: ErrorContextToAnalyze) {
    for (let log of progress.logs) {
      if (log.message.match(/npm install.+returned a non-zero code/g)) {
        return true;
      }
    }
    return false;
  }

  hasNpmDependencyDownloadError(progress: ErrorContextToAnalyze) {
    for (let log of progress.logs) {
      if (log.message.match('npm ERR! code ETARGET')) {
        return true;
      }
    }
    return false;
  }

  getMissingDependency(progress: ErrorContextToAnalyze) {
    for (let log of progress.logs) {
      if (log.message.match('npm ERR! notarget No matching version found for (.+)')) {
        return log.message.replace(/npm ERR! notarget No matching version found for (.+)/g, '$1');
      }
    }
    return '';
  }

  getUsedBy(progress: ErrorContextToAnalyze) {
    for (let log of progress.logs) {
      if (log.message.match('npm ERR! notarget It was specified as a dependency of (.+)')) {
        return log.message.replace(/npm ERR! notarget It was specified as a dependency of (.+)/g, '$1');
      }
    }
    return '';
  }

  hasNpmDependencyReadError(progress: ErrorContextToAnalyze) {
    let cantFindFile = false;
    let isNodeModulesPath = false;
    for (let log of progress.logs) {
      if (log.message.match('npm ERR! enoent This is related to npm not being able to find a file')) {
        cantFindFile = true;
      }
      if (log.message.match('npm ERR! path .*node_modules')) {
        isNodeModulesPath = true;
      }
    }
    return cantFindFile && isNodeModulesPath;
  }

  async getError(progress: ErrorContextToAnalyze) {
    if (!progress || !progress.logs) {
      trace('not npm dependency issue');
      return null;
    }
    if (this.hasNpmInstallFailed(progress) && this.hasNpmDependencyDownloadError(progress)) {
      trace('npm dependency download error');
      return {
        code: ExitCode.DEPENDENCY_01,
        missingDependency: this.getMissingDependency(progress),
        usedBy: this.getUsedBy(progress)
      };
    }
    if (this.hasNpmInstallFailed(progress) && this.hasNpmDependencyReadError(progress)) {
      trace('npm dependency read error');
      return { code: ExitCode.DEPENDENCY_02 };
    }
    trace('not npm dependency issue');
    return null;
  }
}

module.exports = { MissingNpmDependencyErrorAnalyzer };
