const { getVerbosity } = require('@zetapush/common');
const process = require('process');

const getCometdLogLevel = () => {
  return process.env.COMETD_LOG_LEVEL
    ? toCometdLevel(process.env.COMETD_LOG_LEVEL)
    : cliVerbosityToCometdLogLevel(getVerbosity());
};

const cliVerbosityToCometdLogLevel = (verbosity) => {
  if (verbosity > 3) {
    return 'debug';
  }
  if (verbosity > 2) {
    return 'info';
  }
  return 'warn';
};

const toCometdLevel = (level) => {
  switch (level) {
    case 'silly':
      return 'debug';
    case 'verbose':
    case 'debug':
    case 'info':
      return 'info';
    default:
      return 'warn';
  }
};

module.exports = { getCometdLogLevel };
