const copydir = require('copy-dir');
const {
  rm,
  npmInit,
  zetaPush,
  readZetarc,
  Runner,
  createZetarc,
  npmInstallLatestVersion,
  nukeApp,
  setAccountToZetarc,
  setAppNameToZetarc,
  getCurrentEnv,
} = require('./commands');
const { WeakClient } = require('@zetapush/client');
const transports = require('@zetapush/cometd/lib/node/Transports');
const {
  userActionLogger,
  givenLogger,
  frontUserActionLogger,
  cleanLogger,
  envLogger,
} = require('./logger');

const given = () => {
  return new Given();
};

module.exports = {
  given,
  userAction,
  autoclean,
  consoleUserAction,
  frontUserAction,
};
