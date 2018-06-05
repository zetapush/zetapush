#!/usr/bin/env node

'use strict';

const chalk = require('chalk');

const currentNodeVersion = process.versions.node;
const semver = currentNodeVersion.split('.').map((v) => parseInt(v, 10));
const [major, minor] = semver;

if (major < 8 || (major <= 8 && minor < 11)) {
  console.error(
    chalk.red(
      'You are running Node ' +
        currentNodeVersion +
        '.\n' +
        'Create ZetaPush App requires Node 8.11 or higher. \n' +
        'Please update your version of Node.'
    )
  );
  process.exit(1);
}

require('./createApp');
