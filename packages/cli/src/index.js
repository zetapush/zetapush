// Packages
const {
  createAccount,
  createApplication,
  DEFAULTS,
  fetch,
} = require('@zetapush/core');
const logger = require('@zetapush/core');
const { getDeveloperLogin, getDeveloperPassword } = require('./utils/security');

module.exports = {
  createAccount,
  createApplication,
  DEFAULTS,
  fetch,
  getDeveloperLogin,
  getDeveloperPassword,
  logger,
};
