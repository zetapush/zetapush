const { log, error, trace } = require('./log');
const fs = require('fs');
const request = require('request');
const { URL } = require('url');

/**
 * Upload user code archive on ZetaPush platform
 * @param {String} archived
 * @param {Object} config
 */
const upload = (archived, config) =>
  new Promise((resolve, reject) => {
    log(`Uploading`, archived);

    const { developerLogin, developerPassword, platformUrl, appName } = config;
    const { protocol, hostname, port } = new URL(platformUrl);
    const url = `${protocol}//${hostname}:${port}/zbo/orga/recipe/cook`;
    const options = {
      headers: {
        'X-Authorization': JSON.stringify({
          username: developerLogin,
          password: developerPassword,
        }),
      },
      method: 'POST',
      url,
      formData: {
        businessId: appName,
        description: `Deploy on application ${appName}`,
        file: fs.createReadStream(archived),
      },
    };
    log('Upload archive', url);
    trace(
      `credentials`,
      developerLogin,
      developerPassword,
      platformUrl,
      appName,
    );
    request(options, (failure, response, body) => {
      if (failure) {
        trace('Upload failed:', failure);
        return reject({failure, request: options, config});
      }
      if (response.statusCode !== 200) {
        try {
          const { code, context } = JSON.parse(body);
          if (code === 'ALREADY_DEPLOYING' && typeof context === 'object') {
            log(`Uploading`, archived);
            context.recipeId = context.progressToken;
            return resolve(context);
          }
        } catch (exception) {
          trace('Upload body parsing:', exception);
        }
        trace('Upload failed:', response.statusCode, body);
        return reject({ body, statusCode: response.statusCode, request: options, config });
      }
      return resolve(JSON.parse(body));
    });
  });

const BLACKLIST = ['node_modules', '.DS_Store', '.git'];
/**
 * Get a blacklist based filter function
 * @param {String[]} blacklist
 */
const filter = (blacklist) => (filepath, stat) =>
  blacklist.reduce(
    (filtered, check) => filtered && !filepath.includes(check),
    true,
  );

const mkdir = (root) =>
  new Promise((resolve, reject) => {
    fs.mkdir(root, (failure) => {
      if (failure) {
        return reject(failure);
      }
      resolve(root);
    });
  });

module.exports = { upload, filter, BLACKLIST, mkdir };
