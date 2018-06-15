const { displayHelpMessage } = require('../errors/troubleshooting');

const troubleshoot = async (code) => {
  await displayHelpMessage({ code });
};

module.exports = troubleshoot;
