const { ErrorAnalyzer } = require('./troubleshooting');
const { todo } = require('@zetapush/common');

class OnApplicationBoostrapErrorAnalyser extends ErrorAnalyzer {
  async getError(err) {
    todo(err);
    // FIXME: add test with onApplicationBootstrap and then restore help analysis
    return null;
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
            message: error.message
          };
        }
      }
    }
    return null;
  }
}

module.exports = { OnApplicationBoostrapErrorAnalyser };
