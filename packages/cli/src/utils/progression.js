const { EOL } = require('os');
const update = require('log-update');
const chalk = require('chalk');

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

const displayProgress = (steps) => {
  /*

*/

  const getColor = (step) => {
    if (step.hasUnrecoverableErrors) return 'red';
    if (step.hasErrors) return 'yellow';
    if (step.finished) return 'green';
    return 'blue';
  };

  const round = (value, opposite = false) => Math.round(opposite ? 20 - (value * 20) / 100 : (value * 20) / 100);
  const empty = (step) => chalk`{${getColor(step)} ░}`;
  const full = (step) => chalk`{${getColor(step)} ▇}`;
  const isStepInError = (step) => step.hasUnrecoverableErrors || step.hasErrors;
  const log = (step) =>
    chalk`[{${isStepInError(step) ? 'red' : 'cyan'}.bold ${isStepInError(step) ? 'ERROR' : 'INFO'}}] `;
  const progressbar = (step) =>
    `${log(step)}${full(step).repeat(round(step.progress))}${empty(step).repeat(round(step.progress, true))} ${
      step.name
    }`;
  const output = steps.map(progressbar).join(EOL);
  update(output);
};

const getProgression = (config, recipeId) => {
  const events = getDeploymentProgression(config, recipeId);
  events.on(ProgressEvents.PROGRESSION, async ({ progressDetail }) => {
    const { steps } = progressDetail;
    displayProgress(steps);
  });
  events.on(ProgressEvents.SUCCESS, async ({ fronts, workers }) => {
    log(`Application status`);
    Object.entries(fronts).forEach(([name, deployed]) => {
      const url = deployed.urls['USER_FRIENDLY'];
      info(`Web application ${name} is available at ${url}`);
    });
    Object.entries(workers).forEach(([name, deployed]) => {
      const url = deployed.urls['USER_FRIENDLY'];
      info(`Worker application ${name} is available at ${url}`);
    });
    info(`Worker applications works only if you listen process.env.HTTP_PORT`);
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
