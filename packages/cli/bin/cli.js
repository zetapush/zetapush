#!/usr/bin/env node

const program = require('commander');

const { version } = require('../package.json');

const DEFAULTS = require('./utils/defaults');

const push = require('./commands/push');
const run = require('./commands/run');
const register = require('./commands/register');

const { load } = require('./loader/worker');

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
  .option('-w, --worker', 'Run worker on local platform')
  .arguments('[basepath]')
  .description('Run your code')
  .action((basepath = DEFAULTS.CURRENT_WORKING_DIRECTORY, command) =>
    register(basepath, command)
      .then((config) => Promise.all([config, load(basepath)]))
      .then(([config, declaration]) =>
        run(command.parent, basepath, config, declaration),
      ),
  );

program
  .command('push')
  .option('-f, --front', 'Push front on cloud platform')
  .option('-w, --worker', 'Push worker on cloud platform')
  .arguments('[basepath]')
  .description('Push your application on ZetaPush platform')
  .action((basepath = DEFAULTS.CURRENT_WORKING_DIRECTORY, command) =>
    register(basepath, command)
      .then((config) => Promise.all([config, load(basepath)]))
      .then(([config, declaration]) =>
        push(command.parent, basepath, config, declaration),
      ),
  );

program
  .command('register')
  .arguments('[basepath]')
  .description('Register your account')
  .action((basepath = DEFAULTS.CURRENT_WORKING_DIRECTORY, command) =>
    register(basepath, command),
  );

program.parse(process.argv);
