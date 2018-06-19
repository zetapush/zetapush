const chalk = require('chalk');

const setVerbosity = (verbosity) => {
  global.loggerVerbosity = verbosity;
};

const trace = (message, ...messages) => {
  if (global.loggerVerbosity < 3) return;
  console.debug(
    chalk`{gray [TRACE] ${message}}`,
    messages.length > 0 ? messages : '',
    '\u200C',
  );
};

const log = (message, ...messages) => {
  if (global.loggerVerbosity < 2) return;
  console.log(
    chalk`[{cyan.bold LOG}] ${message}`,
    messages.length > 0 ? messages : '',
    '\u200C',
  );
};

const info = (message, ...messages) => {
  if (global.loggerVerbosity < 1) return;
  console.info(
    chalk`[{cyan.bold INFO}] {bold ${message}}`,
    messages.length > 0 ? messages : '',
    '\u200C',
  );
};

const help = (message, ...messages) => {
  console.info(
    chalk`{blue.bold (?)} ${message}`,
    messages.length > 0 ? messages : '',
    '\u200C',
  );
};

const error = (message, ...messages) =>
  console.error(
    chalk`[{red.bold ERROR}] {bold ${message}}`,
    messages.length > 0 ? messages : '',
    '\u200C',
  );

const todo = (message, ...messages) =>
  console.warn(
    chalk`[{keyword('orange').bold TODO}] {bold ${message}}`,
    messages.length > 0 ? messages : '',
    '\u200C',
  );

const experimental = (message, ...messages) =>
  console.warn(
    chalk`[{keyword('magenta').bold EXPERIMENTAL}] {bold ${message}}`,
    messages.length > 0 ? messages : '',
    '\u200C',
  );

const warn = (message, ...messages) =>
  console.warn(
    chalk`[{yellow.bold WARN}] {bold ${message}}`,
    messages.length > 0 ? messages : '',
    '\u200C',
  );

setVerbosity(1);

module.exports = {
  trace,
  log,
  info,
  error,
  todo,
  warn,
  help,
  experimental,
  setVerbosity,
};
