const { trace, log, error, info, help } = require('../utils/log');
const os = require('os');

const isLinux = () => {
  return os.platform()=='linux'
}

const isWindows = () => {
  return os.platform().startsWith('win')
}

module.exports = { isLinux, isWindows }