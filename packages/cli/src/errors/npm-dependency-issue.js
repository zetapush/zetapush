const { ErrorAnalyzer } = require('./troubleshooting');

class MissingNpmDependencyErrorAnalyzer extends ErrorAnalyzer {
  hasNpmInstallFailed(progress) {
    for (let log of progress.logs) {
      if (log.message.match(/npm install.+returned a non-zero code/g)) {
        return true;
      }
    }
    return false;
  }

  hasNpmDependencyDownloadError(progress) {
    for (let log of progress.logs) {
      if (log.message.match('npm ERR! code ETARGET')) {
        return true;
      }
    }
    return false;
  }

  getMissingDependency(progress) {
    for (let log of progress.logs) {
      if (
        log.message.match(
          'npm ERR! notarget No matching version found for (.+)',
        )
      ) {
        return log.message.replace(
          /npm ERR! notarget No matching version found for (.+)/g,
          '$1',
        );
      }
    }
    return '';
  }

  getUsedBy(progress) {
    for (let log of progress.logs) {
      if (
        log.message.match(
          'npm ERR! notarget It was specified as a dependency of (.+)',
        )
      ) {
        return log.message.replace(
          /npm ERR! notarget It was specified as a dependency of (.+)/g,
          '$1',
        );
      }
    }
    return '';
  }

  hasNpmDependencyReadError(progress) {
    let cantFindFile = false;
    let isNodeModulesPath = false;
    for (let log of progress.logs) {
      if (
        log.message.match(
          'npm ERR! enoent This is related to npm not being able to find a file',
        )
      ) {
        cantFindFile = true;
      }
      if (log.message.match('npm ERR! path .*node_modules')) {
        isNodeModulesPath = true;
      }
    }
    return cantFindFile && isNodeModulesPath;
  }

  getError(progress) {
    if (!progress || !progress.logs) {
      return null;
    }
    if (
      this.hasNpmInstallFailed(progress) &&
      this.hasNpmDependencyDownloadError(progress)
    ) {
      return {
        code: 'DEPENDENCY-01',
        missingDependency: this.getMissingDependency(progress),
        usedBy: this.getUsedBy(progress),
      };
    }
    if (
      this.hasNpmInstallFailed(progress) &&
      this.hasNpmDependencyReadError(progress)
    ) {
      return { code: 'DEPENDENCY-02' };
    }
    return null;
  }
}

module.exports = { MissingNpmDependencyErrorAnalyzer };
