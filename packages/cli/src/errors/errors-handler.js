const fs = require('fs');
const path = require('path');
const os = require('os');
const { error } = require('@zetapush/common');

const displayError = (steps) => {
  steps.forEach((step) => {
    if (step.hasUnrecoverableErrors) {
      error(
        `${step.name} failed\n        Causes:\n${getErrorsStr(
          step
        )}\n\n        Error logs:\n${getErrorsFromAssociatedLogsStr(step)}`
      );
    }
  });
};

const getErrorsFromAssociatedLogsStr = (step) => {
  return step.associatedLogs
    .filter((e) => e.level.name == 'ERROR')
    .map((e) => e.message.replace(/^(.*)$/g, '          $1'))
    .join('\n');
};

const writeLogs = (config, logs, steps) => {
  const workingDir = os.homedir();
  const zetaDir = path.join(workingDir, '.zeta');
  fs.existsSync(zetaDir) || fs.mkdirSync(zetaDir);
  const logFile = path.join(zetaDir, `${config.appName}-${Date.now()}.log`);
  fs.writeFileSync(
    logFile,
    `Context:
    developer-login=${config.developerLogin}
    platform-url=${config.platformUrl}
    app-name=${config.appName}
------------------------------------------------------------

`
  );
  fs.appendFileSync(logFile, getLogsStr(logs, steps));
  return logFile;
};

const getErrorsStr = (step) => {
  if (!step.hasUnrecoverableErrors) {
    return '';
  }
  return step.errors.map((e) => e.message.replace(/^(.*)$/g, '          - $1')).join('\n');
};

const getStepName = (step, steps) => {
  for (let s of steps) {
    if (s.id == step) {
      return s.name;
    }
  }
  return step;
};

const formatDate = (ts) => {
  return new Date(ts).toISOString();
};

const getLogsStr = (logs, steps) => {
  return logs
    .map(
      (log) =>
        `${fixedSize(getStepName(log.step, steps), 50)} ${fixedSize(log.category.name, 20)} | ${formatDate(
          log.timestamp
        )} [${log.level.name}] ${log.category.context || ''} ${log.message}`
    )
    .join('\n');
};

const fixedSize = (str, max) => {
  return str.length > max ? str.substring(0, max - 3) + '...' : str.padEnd(max, ' ');
};

module.exports = { writeLogs, displayError };
