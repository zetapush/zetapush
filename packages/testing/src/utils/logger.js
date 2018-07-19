const stream = require('stream');
const winston = require('winston');
const path = require('path');
const chalk = require('chalk');
const jsonStringify = require('fast-safe-stringify');

const logPath = path.join(__dirname, '..', '..', '.logs');

const fixedSize = (str, size) => {
  return str.padEnd(size, ' ').substr(0, size);
};

const fixedSizeLevel = (str, size) => {
  return str.replace(/(error|warn|info|debug|verbose|silly)/i, (_, s) =>
    fixedSize(s, size),
  );
};

const upper = (str) => {
  return str.replace(/(error|warn|info|debug|verbose|silly)/i, (_, s) =>
    s.toUpperCase(),
  );
};

const stringifiedRest = (info) => {
  const json = jsonStringify(
    Object.assign({}, info, {
      timestamp: undefined,
      label: undefined,
      level: undefined,
      message: undefined,
      splat: undefined,
    }),
  );
  // do not display empty objects
  return json == '{}' ? '' : json;
};

const myFormat = (fmt) => {
  return winston.format.printf((info) => {
    const label = fmt
      ? chalk`{${fmt} ${fixedSize(info.label, 18)}}`
      : fixedSize(info.label, 18);
    const message = fmt ? chalk`{${fmt} ${info.message}}` : info.message;
    return `${fixedSizeLevel(upper(info.level), 7)} ${
      info.timestamp
    } - ${label} | ${message} ${stringifiedRest(info)}`;
  });
};

const addCategorizedLogger = (name, label, fmt) => {
  winston.loggers.add(name, {
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.label({ label }),
      winston.format.timestamp(),
      winston.format.splat(),
      myFormat(fmt),
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
            .replace(/[.][0-9]{3}Z$/, 's')}.log`,
        ),
        format: winston.format.combine(
          winston.format.uncolorize(),
          winston.format.label({ label }),
          winston.format.timestamp(),
          winston.format.splat(),
          myFormat(null),
        ),
      }),
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
    ],
  });
  return winston.loggers.get(name);
};

const givenLogger = addCategorizedLogger('given', 'GIVEN', 'grey');
const userActionLogger = addCategorizedLogger(
  'userAction',
  'USER ACTION',
  'bold',
);
const frontUserActionLogger = addCategorizedLogger(
  'frontUserAction',
  'FRONT USER ACTION',
  'bold',
);
const cleanLogger = addCategorizedLogger('clean', 'CLEAN', 'grey');
const commandLogger = addCategorizedLogger('command', 'COMMAND', '');
const envLogger = addCategorizedLogger('env', 'ENV', 'grey');
const subProcessLogger = addCategorizedLogger(
  'subProcess',
  'PROCESS STDOUT/STDERR',
  '',
);

class SubProcessLoggerStream extends stream.Writable {
  constructor(level) {
    super();
    this.level = level;
  }

  _write(chunk, enc, next) {
    subProcessLogger.log(
      this.level,
      chunk
        .toString()
        // remove last new line as it will be added by winston
        .replace(/\r?\n$/g, '')
        // indent each line
        .replace(/^/gm, ' '.repeat(54) + '| ')
        // do not indent first line
        .replace(/^ {54}[|] /, ''),
    );
    next();
  }
}

module.exports = {
  givenLogger,
  userActionLogger,
  frontUserActionLogger,
  cleanLogger,
  commandLogger,
  subProcessLogger,
  SubProcessLoggerStream,
  envLogger,
};
