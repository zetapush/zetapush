const ProgressBar = require('node-progress-bars');

const {
  log,
  error,
  info,
  warn,
  trace,
  getDeploymentProgression,
  ProgressEvents,
  ProgressFailureCauses
} = require('@zetapush/common');
const { displayHelp, displayError, writeLogs } = require('@zetapush/troubleshooting');

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
          blank: '░'
        });
      }
      progress[step.id].setSchema(`:bar.${getProgressionColor(step)} ${step.name}`);
      progress[step.id].update(step.progress / 100);
    });
  } catch (e) {
    trace("can't display progress => fallback", e);
    console.log(''.padEnd(60, '-'));
    steps.forEach((step) => {
      const progressChars = Math.floor((step.progress * 20) / 100);
      const blankChars = 20 - progressChars;
      console.log(`${''.padEnd(progressChars, '▇')}${''.padEnd(blankChars, '░')} ${step.name}`);
    });
  }
};

const getProgression = (config, recipeId) => {
  const progress = {};
  const events = getDeploymentProgression(config, recipeId);
  events.on(ProgressEvents.PROGRESSION, async ({ progressDetail }) => {
    const { steps } = progressDetail;
    displayProgress(progress, steps);
  });
  events.on(ProgressEvents.SUCCESS, async ({ fronts }) => {
    log(`Application status`);
    Object.entries(fronts).forEach(([name, urls]) => {
      info(`Your frontend application ${name} is available at ${urls[urls.length - 1]}`);
    });
  });
  events.on(ProgressEvents.FAILED, async ({ progressDetail, config, cause, failure }) => {
    if (cause === ProgressFailureCauses.PROGRESSION_RETRYING) {
      warn('Failed to get progression. Retrying...', failure);
    } else if (cause === ProgressFailureCauses.LIVE_STATUS_FAILED) {
      error(`Unable to get Application status`, failure);
      await displayHelp(failure);
    } else if (cause === ProgressFailureCauses.PROGRESSION_UNAVAILABLE) {
      error('Failed to get progression', failure);
      await displayHelp(failure);
    } else {
      const { steps, logs } = progressDetail;
      process.stdout.removeAllListeners('before:newlines'); // FIXME: ugly hack required to avoid duplication of unfinished progressbars
      console.log();
      // display errors in console
      displayError(steps);
      // write logs in a file for debugging
      const logFile = writeLogs(config, logs, steps);
      info(`A complete log of this run can be found in:
            ${logFile}`);
      await displayHelp(progressDetail);
    }
  });
};

module.exports = { getProgression };
