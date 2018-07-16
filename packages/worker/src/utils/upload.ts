import { log, trace, Config } from '@zetapush/core';
import * as fs from 'fs';
import { PathLike, Stats } from 'fs';
const request = require('request');
import { Response } from 'request';
import { URL } from 'url';

/**
 * Upload user code archive on ZetaPush platform
 * @param {String} archived
 * @param {Object} config
 */
export const upload = (archived: PathLike, config: Config) =>
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
    request(options, (failure: any, response: Response, body: any) => {
      if (failure) {
        trace('Upload failed:', failure);
        return reject({ failure, request: options, config });
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
        return reject({
          body,
          statusCode: response.statusCode,
          request: options,
          config,
        });
      }
      return resolve(JSON.parse(body));
    });
  });

export const BLACKLIST = ['node_modules', '.DS_Store', '.git'];

/**
 * Get a blacklist based filter function
 * @param {String[]} blacklist
 */
export const filter = (blacklist: string[]) => (
  filepath: string,
  stat: Stats,
) =>
  blacklist.reduce(
    (filtered, check) => filtered && !filepath.includes(check),
    true,
  );
