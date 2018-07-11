const process = require('process');
const { URL } = require('url');
const request = require('request');
// const { fetch } = require('@zetapush/cli/src/utils/network');
// const { createApplication } = require('@zetapush/cli/src/utils/createApplication');

const createApp = async (developerLogin, developerPassword) => {
  // try {
  //   return await createApplication(config(developerLogin, developerPassword));
  // } catch (err) {
  //   throw new Error(`Failed to create application. Cause: ${err.message}`);
  // }
};

const nukeApp = async (appOrAppName, developerLogin, developerPassword) => {
  // const appName = (appOrAppName && appOrAppName.appName) || appOrAppName;
  // if (!appName) {
  //   return;
  // }
  // try {
  //   await fetch({
  //     method: 'DELETE',
  //     config: config(developerLogin, developerPassword),
  //     pathname: `orga/business/nuke/${appName}`
  //   });
  // } catch (err) {
  //   throw new Error(`Failed to nuke application '${appName}'. Cause: ${err.message}`);
  // }
};

const config = (developerLogin, developerPassword) => {
  const conf = {
    developerLogin: developerLogin || process.env.ZETAPUSH_DEVELOPER_LOGIN,
    developerPassword: developerPassword || process.env.ZETAPUSH_DEVELOPER_PASSWORD,
    platformUrl: process.env.ZETAPUSH_PLATFORM_URL || `https://celtia.zetapush.com/zbo/pub/business`
  };
  if (!conf.developerLogin) {
    throw new Error('Missing developerLogin. You have to provide ZETAPUSH_DEVELOPER_LOGIN environment variables');
  }
  if (!conf.developerPassword) {
    throw new Error('Missing developerPassword. You have to provide ZETAPUSH_DEVELOPER_PASSWORD environment variables');
  }
  return conf;
};

// /**
//  * Get prefered cluster
//  * @param {Object} config
//  */
// const getPreferedCluster = (config) =>
//   fetch({ config, pathname: 'orga/cluster/list' }).then((clusters) => {
//     const [cluster] = clusters.filter(({ preferred }) => Boolean(preferred));
//     return cluster;
//   });
// /**
//  * Get developer profile info
//  * @param {Object} config
//  */
// const whoami = (config) => fetch({ config, pathname: 'auth/whoami' });
// /**
//  * Create business application
//  * @param {Object} config
//  * @param {Object} orga
//  * @param {Object} cluster
//  */
// const create = (config, orga, cluster) =>
//   fetch({
//     config,
//     method: 'POST',
//     pathname: 'orga/business/create',
//     body: JSON.stringify({
//       orgaId: orga.id,
//       cluster: cluster.id,
//       name: `app@${uuid()}`,
//       description: 'app'
//     })
//   });

// const createApplication = (config) =>
//   Promise.all([whoami(config), getPreferedCluster(config)])
//     .then(([me, cluster]) => create(config, me.orga, cluster))
//     .then((application) => ({
//       ...config,
//       appName: application.businessId,
//       envName: ''
//     }));

// const fetch = ({ anonymous = false, body, config, method = 'GET', pathname }) =>
//   new Promise((resolve, reject) => {
//     const headers = {
//       'Content-Type': 'application/json;charset=UTF-8'
//     };
//     if (!anonymous) {
//       const { developerLogin, developerPassword } = config;
//       headers['X-Authorization'] = JSON.stringify({
//         username: developerLogin,
//         password: developerPassword
//       });
//     }
//     const { platformUrl } = config;
//     const { protocol, hostname, port } = new URL(platformUrl);
//     const url = `${protocol}//${hostname}:${port}/zbo/${pathname}`;
//     const options = {
//       body,
//       headers,
//       method,
//       url
//     };
//     request(options, (failure, response, body) => {
//       if (failure) {
//         return reject({ failure, request: options });
//       }
//       if (response.statusCode !== 200) {
//         return reject({
//           response,
//           statusCode: response.statusCode,
//           body,
//           request: options,
//           config
//         });
//       }
//       try {
//         const parsed = JSON.parse(body);
//         return resolve(parsed);
//       } catch (failure) {
//         return reject({
//           failure,
//           statusCode: response.statusCode,
//           body,
//           request: options,
//           config
//         });
//       }
//     });
//   });

// /**
//  * Alpha numeric dictionary
//  */
// const DICTIONARY = 'abcdefghijklmnopqrstuvwxyz0123456789';

// /**
//  * Get random id
//  * @return {string}
//  */
// const uuid = (entropy = 7, dictionary = DICTIONARY) =>
//   Array.from(Array(entropy)).reduce((previous) => {
//     const next = dictionary.charAt(Math.floor(Math.random() * dictionary.length));
//     return `${previous}${next}`;
//   }, '');

// /**
//  * @access private
//  * @param {Array<Object>} list
//  * @return {Object}
//  */
// const shuffle = (list) => {
//   const index = Math.floor(Math.random() * list.length);
//   return list[index];
// };

module.exports = { createApp, nukeApp };
