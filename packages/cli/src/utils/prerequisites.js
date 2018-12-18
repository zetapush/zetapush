const { error, trace, warn } = require('@zetapush/common');
const lockVerify = require('lock-verify');

/**
 * To support Lerna installation context we need do detect tool installation
 */
const skipLockFileCheck = () => {
  let skip = false;
  try {
    require('lerna');
    trace('lerna found in load graph, skip lockfile check');
    skip = true;
  } catch {
    trace('lerna not found, continue lockfile check');
  }
  return skip;
};

/**
 * Report if package.json is out of sync with package-lock.json
 * @param {Command} command
 * @returns {Promise<boolean>}
 */
const checkLockFile = (command) =>
  skipLockFileCheck()
    ? Promise.resolve(true)
    : lockVerify(command.worker).then((result) => {
        result.warnings.forEach((warning) => warn(warning));
        if (!result.status) {
          error('Unable to push your worker because your package-lock.json is out sync with package.json');
          result.errors.forEach((failure) => error(failure));
          process.exit(1);
        }
      });

module.exports = { checkLockFile };
