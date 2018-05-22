#!/usr/bin/env node

const program = require('commander');

const { version } = require('../package.json');

const DEFAULTS = require('./utils/defaults');

const push = require('./commands/push');
const run = require('./commands/run');
const register = require('./commands/register');
const bootstrap = require('./utils/bootstrap');

program
  .version(version)
  .option(
    '-u, --platform-url <platform-url>',
    'Platform URL',
    DEFAULTS.PLATFORM_URL,
  )
  .option('-l, --developer-login <developer-login>', 'Developer login')
  .option('-p, --developer-password <developer-password>', 'Developer password')
  .option('-a, --app-name <app-name>', 'Application name')
  .option('-e, --env-name <env-name>', 'Environement name');

program
  .command('run')
  .arguments('[path]')
  .description('Run your code')
  .action((path = DEFAULTS.CURRENT_WORKING_DIRECTORY, command) =>
    bootstrap(path, command).then(({ Api, zetapush }) =>
      run(path, zetapush, Api),
    ),
  );

program
  .command('push')
  .arguments('[path]')
  .description('Push your application on ZetaPush platform')
  .action((path = DEFAULTS.CURRENT_WORKING_DIRECTORY, command) =>
    bootstrap(path, command).then(({ Api, zetapush }) =>
      push(path, zetapush, Api),
    ),
  );

program
  .command('register')
  .arguments('[path]')
  .description('Register your account')
  .action((path = DEFAULTS.CURRENT_WORKING_DIRECTORY, command) =>
    register(path, command),
  );

program.parse(process.argv);
