const { displayHelpMessage } = require('@zetapush/troubleshooting');

const troubleshoot = async (code) => {
  await displayHelpMessage({ code });
};

module.exports = troubleshoot;
