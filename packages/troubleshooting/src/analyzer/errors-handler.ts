// NodeJS modules
import fs from 'fs';
import os from 'os';
import path from 'path';
// ZetaPush modules
import { error } from '@zetapush/common';

// Local Types
type Log = any;
type Step = any;
type Config = any;

export const displayError = (steps: Step[]) => {
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

const getErrorsFromAssociatedLogsStr = (step: Step) => {
  return step.associatedLogs
    .filter((log: Log) => log.level.name == 'ERROR')
    .map((log: Log) => log.message.replace(/^(.*)$/g, '          $1'))
    .join('\n');
};

export const writeLogs = (config: Config, logs: Log[], steps: Step[]) => {
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

const getErrorsStr = (step: Step) => {
  if (!step.hasUnrecoverableErrors) {
    return '';
  }
  return step.errors.map((e: any) => e.message.replace(/^(.*)$/g, '          - $1')).join('\n');
};

const getStepName = (step: Step, steps: Step[]) => {
  for (let s of steps) {
    if (s.id == step) {
      return s.name;
    }
  }
  return step;
};

const formatDate = (ts: number) => {
  return new Date(ts).toISOString();
};

const getLogsStr = (logs: Log[], steps: Step[]) => {
  return logs
    .map(
      (log) =>
        `${fixedSize(getStepName(log.step, steps), 50)} ${fixedSize(log.category.name, 20)} | ${formatDate(
          log.timestamp
        )} [${log.level.name}] ${log.category.context || ''} ${log.message}`
    )
    .join('\n');
};

const fixedSize = (str: string, max: number) => {
  return str.length > max ? str.substring(0, max - 3) + '...' : str.padEnd(max, ' ');
};
