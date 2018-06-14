const { ErrorAnalyzer } = require('./troubleshooting');

class CustomCloudServiceStartErrorAnalyzer extends ErrorAnalyzer {

  hasWorkerStartNpmErr(progress) {
    for (let log of progress.logs) {
      if(log.category=='WORKER_START' && log.message.contains('npm ERR!')) {
        return true
      }
    }
    return false
  }

  getWorkerStartLogs(progress) {
    return progress.logs.filter((l) => l.category=='WORKER_START')
            .map((l) => `${formatDate(l.timestamp)} [${l.level.name}] ${log.category.context || ''} ${log.message}`)
            .join('\n')
  }

  async getError(progress) {
    if (!progress || !progress.logs) {
      trace('not custom cloud service start issue');
      return null
    }
    if(this.hasWorkerStartNpmErr(progress)) {
      return {code: 'SERVICE-05', logs: this.getWorkerStartLogs(progress)}
    }
    return null
  }
}


const formatDate = (ts) => {
  return new Date(ts).toISOString();
};

module.exports = { CustomCloudServiceStartErrorAnalyzer };
