import { fetch } from './utils/network';
import { todo } from './utils/log';

import { Config } from './common-types';

/**
 * Create a new ZetaPush account and returns a valid ZetaPushConfig file
 * @todo Support mandatory fields
 * @param {Object} config
 */
export const createAccount = (config: Config) =>
  fetch({
    anonymous: true,
    config,
    method: 'POST',
    pathname: 'adm/organization/shortcut',
    body: JSON.stringify({
      orga: {
        orga: {
          name: `YourOrganizationName`,
          description: `YourOrganizationDescription`,
          owner: {
            firstName: `YourFirstName`,
            lastName: `YourLastname`,
            email: config.developerLogin
          }
        },
        credentials: {
          password: config.developerPassword
        }
      }
    }),
    debugName: 'createAccount'
  })
    .then((business: any) => ({
      ...config,
      appName: business.businessId,
      envName: ''
    }))
    .catch((failure: any) => {
      try {
        const body = JSON.parse(failure.body);
        if (body.code !== 'EMAIL_EXISTS') {
          todo(`Catch 'createAccount' failure`, body);
        }
      } catch (exception) {
        todo(`Catch 'createAccount' failure`, exception);
      }
      return {
        ...config
      };
    });
