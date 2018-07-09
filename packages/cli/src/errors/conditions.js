const os = require('os');

const isLinux = () => os.platform() == 'linux';

const isWindows = () => os.platform().startsWith('win');

module.exports = { isLinux, isWindows };
