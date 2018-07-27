const { ErrorAnalyzer } = require('./troubleshooting');

class OnApplicationBoostrapErrorAnalyser extends ErrorAnalyzer {
  async getError(err) {
    // RUN LOCAL
    if (err.code) {
      err.code = 'BOOTSTRAP-01';
      return err;
    }
    // PUSH
    for (let step of err.steps) {
      for (let error of step.errors) {
        if (error.cause.code === 'EBOOTFAIL') {
          return {
            code: 'BOOTSTRAP-01',
            message: error.message,
          };
        }
      }
    }
    return null;
  }
}

module.exports = { OnApplicationBoostrapErrorAnalyser };
