const { URL } = require('url');
const request = require('request');
const { log, error } = require('./log');
const ProgressBar = require('ascii-progress');

/**
 * Get deployment progression for a given recipe id (aka deployment token)
 * @param {Object} config
 * @param {String} recipeId
 */
const getProgress = (config, recipeId) =>
  new Promise((resolve, reject) => {
    const { developerLogin, developerPassword, platformUrl, appName } = config;
    const { protocol, hostname, port } = new URL(platformUrl);
    const url = `${protocol}//${hostname}:${port}/zbo/orga/recipe/status/${appName}/${recipeId}`;
    const options = {
      headers: {
        'X-Authorization': JSON.stringify({
          username: developerLogin,
          password: developerPassword,
        }),
      },
      method: 'GET',
      url,
    };
    // log('Get progresssion', url);
    request(options, (failure, response, body) => {
      if (failure) {
        reject(failure);
        return error('Get progresssion failed', failure);
      }
      if (response.statusCode !== 200) {
        reject(response.statusCode);
        return error('Get progresssion failed', response.statusCode, body);
      }
      // log('Get progresssion successful', body);
      resolve(JSON.parse(body));
    });
  });

/**
 * Get Application live status
 * @param {Object} config
 */
const getLiveStatus = (config) =>
  new Promise((resolve, reject) => {
    const { developerLogin, developerPassword, platformUrl, appName } = config;
    const { protocol, hostname, port } = new URL(platformUrl);
    const url = `${protocol}//${hostname}:${port}/zbo/orga/business/live/${appName}`;
    const options = {
      headers: {
        'X-Authorization': JSON.stringify({
          username: developerLogin,
          password: developerPassword,
        }),
      },
      method: 'GET',
      url,
    };
    // log('Get progresssion', url);
    request(options, (failure, response, body) => {
      if (failure) {
        reject(failure);
        return error('Get live status failed', failure);
      }
      if (response.statusCode !== 200) {
        reject(response.statusCode);
        return error('Get live status failed', response.statusCode, body);
      }
      // log('Get progresssion successful', body);
      try {
        const parsed = JSON.parse(body);
        const nodes = Object.values(parsed.nodes);
        const fronts = nodes.reduce((reduced, node) => {
          const contexts =
            node.liveData['jetty.local.static.files.contexts'] || [];
          return {
            ...reduced,
            ...contexts.reduce((acc, context) => {
              acc[context.name] = context.urls;
              return acc;
            }, {}),
          };
        }, {});
        resolve(fronts);
      } catch (failure) {
        reject(failure);
        return error('Get live status failed', failure);
      }
    });
  });

const getProgression = (config, recipeId) => {
  const progress = {};

  (async function check() {
    try {
      const { progressDetail } = await getProgress(config, recipeId);
      const { steps, finished } = progressDetail;
      steps.forEach((step) => {
        if (!progress[step.id]) {
          progress[step.id] = new ProgressBar({
            total: 100,
            width: 20,
            schema: `[STAT] :bar ${step.name}`,
            blank: '░',
          });
        }
        progress[step.id].update(step.progress / 100);
      });
      if (!finished) {
        setTimeout(check, 2500);
      } else {
        getLiveStatus(config)
          .then((fronts) => {
            log(`Application status`);
            Object.entries(fronts).forEach(([name, urls]) => {
              log(
                `Your frontend application ${name} is available at ${
                  urls[urls.length - 1]
                }`,
              );
            });
          })
          .catch((failure) =>
            error(`Unable to get Application status`, failure),
          );
      }
    } catch (ex) {
      error('Progression', ex);
    }
  })();
};

const checkQueueServiceDeployed = (config, recipeId) => {
  return new Promise((resolve, reject) => {
    (async function check() {
      try {
        const { progressDetail } = await getProgress(config, recipeId);
        const { finished } = progressDetail;

        if (!finished) {
          setTimeout(check, 2500);
        } else {
          resolve(recipeId);
        }
      } catch (ex) {
        error('Progression', ex);
        reject(ex);
      }
    })();
  });
};

module.exports = { getLiveStatus, getProgression, checkQueueServiceDeployed };
