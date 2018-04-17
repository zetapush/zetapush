#!/usr/bin/env node

const program = require('commander');

const { version } = require('../package.json');

const push = require('./commands/push');
const run = require('./commands/run');
const init = require('./commands/init');
const bootstrap = require('./utils/bootstrap');

program
  .version(version)
  .option('-a, --api-url <api-url>', 'Api url')
  .option('-l, --login <login>', 'Account login')
  .option('-p, --password <password>', 'Account password')
  .option('-f, --front-only', 'Only front code')
  .option('-s, --sandbox-id <sandbox-id>', 'Sandbox id');

program
  .command('run <path>')
  .description('Run your code')
  .action((path, command) =>
    bootstrap(path, command).then(({ Api, zetapush }) =>
      run(path, zetapush, Api),
    ),
  );

program
  .command('push <path>')
  .description('push your code on remote cloud')
  .action((path, command) =>
    bootstrap(path, command).then(({ Api, zetapush }) =>
      push(path, zetapush, Api),
    ),
  );

program
  .command('new <app>')
  .description('Create your application')
  .action((app, command) =>
    bootstrap(app, command).then(({ Api, zetapush }) =>
      init(app, zetapush, Api),
    ),
  );

program.parse(process.argv);
