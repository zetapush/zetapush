const { displayHelpMessage } = require('../errors/troubleshooting');

const troubleshoot = async (errorCode, command) => {
  await displayHelpMessage({ code: errorCode });
};

module.exports = troubleshoot;
