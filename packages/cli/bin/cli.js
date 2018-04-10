#!/usr/bin/env node

const program = require('commander');

const { version } = require('../package.json');

const push = require('./commands/push');
const run = require('./commands/run');
const bootstrap = require('./utils/bootstrap');

program
  .version(version)
  .option('-l, --login <login>', 'account login')
  .option('-p, --password <password>', 'account password')
  .option('-p, --sandbox <sandbox>', 'sandbox id');

program
  .command('run <path>')
  .description('Run your code')
  .action((path) =>
    bootstrap(path).then(({ Api, zetapush }) => run(zetapush, Api)),
  );

program
  .command('push <path>')
  .description('push your code on remote cloud')
  .action((path) =>
    bootstrap(path).then(({ Api, zetapush }) => push(path, zetapush, Api)),
  );

program.parse(process.argv);
