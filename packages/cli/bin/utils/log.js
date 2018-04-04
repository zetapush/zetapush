const chalk = require('chalk');

const log = (message, ...messages) =>
  console.log(
    chalk`[{cyan LOG}] {whiteBright ${message}}`,
    messages.length > 0 ? messages : '',
  );

const error = (message, ...messages) =>
  console.error(
    chalk`[{red ERROR}] {whiteBright ${message}}`,
    messages.length > 0 ? messages : '',
  );

const todo = (message, ...messages) =>
  console.warn(
    chalk`[{keyword('orange') TODO}] {whiteBright ${message}}`,
    messages.length > 0 ? messages : '',
  );

const warn = (message, ...messages) =>
  console.warn(
    chalk`[{yellow WARN}] {whiteBright ${message}}`,
    messages.length > 0 ? messages : '',
  );

module.exports = { log, error, todo, warn };
