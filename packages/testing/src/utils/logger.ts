import { Writable } from 'stream';
import { setVerbosity, getZetaFilePath } from '@zetapush/common';
import * as process from 'process';
const winston = require('winston');
const path = require('path');
const chalk = require('chalk');
const jsonStringify = require('fast-safe-stringify');

const logPath = getZetaFilePath('.logs');

const fixedSize = (str: string, size: number) => {
  return str.padEnd(size, ' ').substr(0, size);
};

const fixedSizeLevel = (str: string, size: number) => {
  return str.replace(/(error|warn|info|debug|verbose|silly)/i, (_, s) => fixedSize(s, size));
};

const upper = (str: string) => {
  return str.replace(/(error|warn|info|debug|verbose|silly)/i, (_, s) => s.toUpperCase());
};

const stringifiedRest = (info: any) => {
  const json = jsonStringify(
    Object.assign({}, info, {
      timestamp: undefined,
      label: undefined,
      level: undefined,
      message: undefined,
      splat: undefined
    })
  );
  // do not display empty objects
  return json == '{}' ? '' : json;
};

const myFormat = (fmt?: string | null) => {
  return winston.format.printf((info: any) => {
    const label = fmt ? chalk`{${fmt} ${fixedSize(info.label, 18)}}` : fixedSize(info.label, 18);
    const message = fmt ? chalk`{${fmt} ${info.message}}` : info.message;
    return `${fixedSizeLevel(upper(info.level), 7)} ${info.timestamp} - ${label} | ${message} ${stringifiedRest(info)}`;
  });
};

export const addCategorizedLogger = (name: string, label: string, fmt?: string) => {
  winston.loggers.add(name, {
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.label({ label }),
      winston.format.timestamp(),
      winston.format.splat(),
      myFormat(fmt)
    ),
    level: process.env.ZETAPUSH_LOG_LEVEL || 'info',
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({
        level: 'silly',
        filename: path.join(
          logPath,
          `all.${new Date()
            .toISOString()
            .replace('T', ' ')
            .replace(':', 'h')
            .replace(':', 'm')
            .replace(/[.][0-9]{3}Z$/, 's')}.log`
        ),
        format: winston.format.combine(
          winston.format.uncolorize(),
          winston.format.label({ label }),
          winston.format.timestamp(),
          winston.format.splat(),
          myFormat(null)
        )
      })
      // new winston.transports.File({
      //   filename: path.join(logPath, 'infos.log'),
      //   // level: 'info',
      //   // timestamp: tsFormat,
      // }),
      // new winston.transports.File({
      //   filename: path.join(logPath, 'errors.log'),
      //   // level: 'error',
      //   // timestamp: tsFormat,
      // }),
    ]
  });
  return winston.loggers.get(name);
};

export const givenLogger = addCategorizedLogger('given', 'GIVEN', 'grey');
export const userActionLogger = addCategorizedLogger('userAction', 'USER ACTION', 'bold');
export const frontUserActionLogger = addCategorizedLogger('frontUserAction', 'FRONT USER ACTION', 'bold');
export const runInWorkerLogger = addCategorizedLogger('runInWorker', 'RUN IN WORKER', 'grey');
export const cleanLogger = addCategorizedLogger('clean', 'CLEAN', 'grey');
export const commandLogger = addCategorizedLogger('command', 'COMMAND', '');
export const envLogger = addCategorizedLogger('env', 'ENV', 'grey');
export const subProcessLogger = addCategorizedLogger('subProcess', 'PROCESS STDOUT/STDERR', '');

export class SubProcessLoggerStream extends Writable {
  constructor(private level: string) {
    super();
  }

  _write(chunk: any, encoding: string, callback: (err?: Error) => void): void {
    subProcessLogger.log(
      this.level,
      chunk
        .toString()
        // remove last new line as it will be added by winston
        .replace(/\r?\n$/g, '')
        // indent each line
        .replace(/^/gm, ' '.repeat(54) + '| ')
        // do not indent first line
        .replace(/^ {54}[|] /, '')
    );
    callback();
  }
}

export const getLogLevelsFromEnv = () => {
  return {
    winston: toWinstonLevel(process.env.ZETAPUSH_LOG_LEVEL || 'info'),
    cometd: toCometdLevel(process.env.COMETD_LOG_LEVEL || 'info'),
    cli: toCliVerbosity(process.env.ZETAPUSH_COMMANDS_LOG_LEVEL || '-vvv')
  };
};

export const toWinstonLevel = (level: string): 'silly' | 'verbose' | 'debug' | 'info' | 'warn' | 'error' => {
  switch (level) {
    case 'silly':
    case 'verbose':
    case 'debug':
    case 'info':
    case 'warn':
    case 'error':
      return level;
    default:
      return 'info';
  }
};

export const toCliVerbosity = (level: string): number => {
  return (level.match(/v/g) || []).length;
};

export const toCometdLevel = (level: string): 'info' | 'debug' | 'warn' => {
  switch (level) {
    case 'silly':
      return 'debug';
    case 'verbose':
    case 'debug':
    case 'info':
      return 'info';
    default:
      return 'warn';
  }
};

setVerbosity(getLogLevelsFromEnv().cli);
