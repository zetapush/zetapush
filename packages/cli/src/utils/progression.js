const { fetch } = require('./network');
const { log, error, info, warn, trace, debugObject } = require('./log');
const ProgressBar = require('node-progress-bars');

const { fetch } = require('./network');
const { log, error, info, warn, trace } = require('./log');
const errorsHandler = require('../errors/errors-handler');
const troubleshooting = require('../errors/troubleshooting');

/**
 * Get deployment progression for a given recipe id (aka deployment token)
 * @param {Object} config
 * @param {String} recipeId
 */
const getProgress = (config, recipeId) =>
  fetch({
    config,
    method: 'GET',
    pathname: `orga/recipe/status/${config.appName}/${recipeId}`,
  });

/**
 * Get Application live status
 * @param {Object} config
 */
const getLiveStatus = (config) =>
  fetch({
    config,
    method: 'GET',
    pathname: `orga/business/live/${config.appName}`,
  }).then((response) => {
    const nodes = Object.values(response.nodes);
    return nodes.reduce((reduced, node) => {
      const contexts = node.liveData['jetty.local.static.files.contexts'] || [];
      return {
        ...reduced,
        ...contexts.reduce((acc, context) => {
          acc[context.name] = context.urls;
          return acc;
        }, {}),
      };
    }, {});
  });

const getProgressionColor = (step) => {
  if (step.hasUnrecoverableErrors) return 'red';
  if (step.hasErrors) return 'yellow';
  if (step.finished) return 'green';
  return 'blue';
};

const displayProgress = (progress, steps) => {
  try {
    steps.forEach((step) => {
      if (!progress[step.id]) {
        progress[step.id] = new ProgressBar({
          total: 100,
          width: 20,
          schema: `:bar.${getProgressionColor(step)} ${step.name}`,
          blank: '░',
        });
      }
      progress[step.id].setSchema(
        `:bar.${getProgressionColor(step)} ${step.name}`,
      );
      progress[step.id].update(step.progress / 100);
    });
  } catch (e) {
    trace("can't display progress => fallback", e);
    console.log(''.padEnd(60, '-'));
    steps.forEach((step) => {
      const progressChars = Math.floor((step.progress * 20) / 100);
      const blankChars = 20 - progressChars;
      console.log(
        `${''.padEnd(progressChars, '▇')}${''.padEnd(blankChars, '░')} ${
          step.name
        }`,
      );
    });
  }
};

const getProgression = (config, recipeId) => {
  const progress = {};
  let remainingRetries = 10;

  (async function check() {
    try {
      const { progressDetail } = await getProgress(config, recipeId);
      const { steps, finished, hasUnrecoverableErrors, logs } = progressDetail;
      displayProgress(progress, steps);
      if (!finished && !hasUnrecoverableErrors) {
        setTimeout(check, 500);
      } else if (hasUnrecoverableErrors) {
        process.stdout.removeAllListeners('before:newlines'); // FIXME: ugly hack required to avoid duplication of unfinished progressbars
        console.log();
        // display errors in console
        errorsHandler.displayError(steps);
        // write logs in a file for debugging
        const logFile = errorsHandler.writeLogs(config, logs, steps);
        info(`A complete log of this run can be found in:
              ${logFile}`);
        await troubleshooting.displayHelp(progressDetail);
      } else {
        getLiveStatus(config)
          .then((fronts) => {
            log(`Application status`);
            Object.entries(fronts).forEach(([name, urls]) => {
              info(
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
      debugObject('progression check', { ex });
      warn('Failed to get progression. Retrying...', ex);
      if (remainingRetries-- > 0) {
        setTimeout(check, 500);
      } else {
        error('Failed to get progression', ex);
        await troubleshooting.displayHelp(ex);
      }
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
        reject({ failure: ex, config });
      }
    })();
  });
};

module.exports = { getLiveStatus, getProgression, checkQueueServiceDeployed };
