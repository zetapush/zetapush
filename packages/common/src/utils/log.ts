import * as fs from 'fs';
import { getZetaFilePath } from './files';

let chalk: any;
try {
  chalk = require('chalk');
} catch (e) {
  // FIXME: chalk in browser
  chalk = (...args: any[]) => args.join('');
}

let stringify: any;
try {
  stringify = require('json-stringify-safe');
} catch (e) {
  stringify = JSON.stringify;
}

const conf = {
  loggerVerbosity: 1,
};
export const setVerbosity = (verbosity: number) => {
  conf.loggerVerbosity = verbosity;
};

export const debugObject = (what: string, ...objects: any[]) => {
  if (conf.loggerVerbosity < 4) return;
  for (let obj of objects) {
    for (let name in obj) {
      let file = getZetaFilePath(
        'zeta-debug',
        `${Date.now()}-${what}-${name}.json`,
      );
      try {
        fs.writeFileSync(file, stringify(obj[name], null, 2));
        console.debug(chalk`{gray [TRACE] ${what}-${name} written in ${file}}`);
      } catch (e) {
        try {
          let fallbackFile = getZetaFilePath(
            'zeta-debug',
            `${Date.now()}-${what}-${name}.string`,
          );
          fs.writeFileSync(
            fallbackFile,
            Object.prototype.toString.call(obj[name]),
          );
          console.debug(
            chalk`{gray [TRACE] ${what}-${name} written in ${fallbackFile}}`,
          );
        } catch (err) {
          console.debug(
            chalk`{gray [TRACE] ${what}-${name} couldn't be written in ${file}}`,
            obj[name],
            e,
          );
        }
      }
    }
  }
};

export const trace = (message: any, ...messages: any[]) => {
  if (conf.loggerVerbosity < 3) return;
  console.debug(
    chalk`{gray [TRACE] ${message}}`,
    messages.length > 0 ? messages : '',
    '\u200C',
  );
};

export const log = (message: any, ...messages: any[]) => {
  if (conf.loggerVerbosity < 2) return;
  console.log(
    chalk`[{cyan.bold LOG}] ${message}`,
    messages.length > 0 ? messages : '',
    '\u200C',
  );
};

export const info = (message: any, ...messages: any[]) => {
  if (conf.loggerVerbosity < 1) return;
  console.info(
    chalk`[{cyan.bold INFO}] {bold ${message}}`,
    messages.length > 0 ? messages : '',
    '\u200C',
  );
};

export const help = (message: any, ...messages: any[]) => {
  console.info(
    chalk`{blue.bold (?)} ${message}`,
    messages.length > 0 ? messages : '',
    '\u200C',
  );
};

export const error = (message: any, ...messages: any[]) =>
  console.error(
    chalk`[{red.bold ERROR}] {bold ${message}}`,
    messages.length > 0 ? messages : '',
    '\u200C',
  );

export const todo = (message: any, ...messages: any[]) =>
  console.warn(
    chalk`[{keyword('orange').bold TODO}] {bold ${message}}`,
    messages.length > 0 ? messages : '',
    '\u200C',
  );

export const experimental = (message: any, ...messages: any[]) =>
  console.warn(
    chalk`[{keyword('magenta').bold EXPERIMENTAL}] {bold ${message}}`,
    messages.length > 0 ? messages : '',
    '\u200C',
  );

export const warn = (message: any, ...messages: any[]) =>
  console.warn(
    chalk`[{yellow.bold WARN}] {bold ${message}}`,
    messages.length > 0 ? messages : '',
    '\u200C',
  );

export const logger = {
  trace,
  log,
  info,
  warn,
  error,
  todo,
  experimental,
  help,
  debugObject,
  setVerbosity,
};

setVerbosity(1);
