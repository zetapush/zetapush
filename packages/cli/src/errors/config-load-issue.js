const { ErrorAnalyzer } = require('./troubleshooting');
const { trace } = require('@zetapush/core');

class ConfigLoadIssueAnalyzer extends ErrorAnalyzer {
  async getError(err) {
    if (err.code != 'CONFIG_LOAD_ERROR') {
      trace('not config issue');
      return null;
    }
    return { code: 'CONFIG-01' };
  }
}

module.exports = { ConfigLoadIssueAnalyzer };
