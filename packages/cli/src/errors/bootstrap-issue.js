const { ErrorAnalyzer } = require('./troubleshooting');
// const { trace } = require('../utils/log');
// const { fetch } = require('../utils/network');

class OnApplicationBoostrapErrorAnalyser extends ErrorAnalyzer {
  async getError(err) {
    console.log('\n\n\n LE MEGA CHIEN \n\n', err);
    return null;
  }
}

module.exports = { OnApplicationBoostrapErrorAnalyser };
