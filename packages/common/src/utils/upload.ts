import { log, trace, debugObject } from './log';
import { URL } from 'url';
import axios, { AxiosError } from 'axios';
require('isomorphic-form-data');
import { Config, ResolvedConfig } from '../common-types';
import { debugAxiosResponse, debugAxiosError } from './network';

/**
 * Upload user code archive on ZetaPush platform
 * @param {String} archived
 * @param {Object} config
 */
export const upload = (archive: any, config: ResolvedConfig) =>
  new Promise((resolve, reject) => {
    // log(`Uploading`, archived);

    const { developerLogin, developerPassword, platformUrl, appName } = config;
    const { protocol, hostname, port } = new URL(platformUrl);
    const url = `${protocol}//${hostname}:${port}/zbo/orga/recipe/cook`;
    const formData = new FormData();
    formData.append('businessId', appName);
    formData.append('description', `Deploy on application ${appName}`);
    formData.append('file', archive, 'app.zip');
    const contentType = (<any>formData).getBoundary
      ? `multipart/form-data; boundary=${(<any>formData).getBoundary()}`
      : undefined;
    const options = {
      headers: {
        'X-Authorization': JSON.stringify({
          username: developerLogin,
          password: developerPassword,
        }),
        Accept: 'application/json',
        'Content-Type': contentType,
      },
      method: 'POST',
      url,
      data: formData,
    };
    log('Upload archive', url);
    trace(
      `credentials`,
      developerLogin,
      developerPassword,
      platformUrl,
      appName,
    );
    axios(options)
      .then((response) => {
        debugAxiosResponse(options, 'upload', response);
        return resolve(response.data);
      })
      .catch((error: AxiosError) => {
        debugAxiosError(options, 'upload', error);
        if (error.response) {
          try {
            const { code, context } = JSON.parse(error.response.data);
            if (code === 'ALREADY_DEPLOYING' && typeof context === 'object') {
              // log(`Uploading`, archived);
              context.recipeId = context.progressToken;
              return resolve(context);
            }
          } catch (exception) {
            trace('Upload body parsing:', exception);
          }
          trace('Upload failed:', error.response.status, error.response.data);
          return reject({
            body: error.response.data,
            statusCode: error.response.status,
            request: options,
            config,
          });
        }
        trace('Upload failed:', error);
        return reject({ failure: error, request: options, config });
      });
  });

export const BLACKLIST = ['node_modules', '.DS_Store', '.git'];

/**
 * Get a blacklist based filter function
 * @param {String[]} blacklist
 */
export const filter = (blacklist: string[]) => (filepath: string) =>
  blacklist.reduce(
    (filtered, check) => filtered && !filepath.includes(check),
    true,
  );
