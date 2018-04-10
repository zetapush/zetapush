#!/usr/bin/env node

const program = require('commander');

const { version } = require('../package.json');

const push = require('./commands/push');
const run = require('./commands/run');
const bootstrap = require('./utils/bootstrap');

program
  .version(version)
  .option('-a, --api-url <api-url>', 'Api url')
  .option('-l, --login <login>', 'Account login')
  .option('-p, --password <password>', 'Account password')
  .option('-s, --sandbox-id <sandbox-id>', 'Sandbox id');

program
  .command('run <path>')
  .description('Run your code')
  .action((path, command) =>
    bootstrap(path, command).then(({ Api, zetapush }) => run(zetapush, Api)),
  );

program
  .command('push <path>')
  .description('push your code on remote cloud')
  .action((path, command) =>
    bootstrap(path, command).then(({ Api, zetapush }) =>
      push(path, zetapush, Api),
    ),
  );

program.parse(process.argv);
