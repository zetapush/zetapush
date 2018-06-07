const { fetch } = require('./network');

/**
 * Create a new ZetaPush account and returns a valid ZetaPushConfig file
 * @param {Object} config
 */
const createAccount = (config) =>
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
            email: config.developerLogin,
          },
        },
        credentials: {
          password: config.developerPassword,
        },
      },
    }),
  }).then((business) => ({
    ...config,
    appName: business.businessId,
    envName: '',
  }));

module.exports = {
  createAccount,
};
