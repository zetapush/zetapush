#!/usr/bin/env node

const program = require('commander');

const { version } = require('../package.json');

const DEFAULTS = require('../src/utils/defaults');
const { identity } = require('../src/utils/validator');
const { setVerbosity, error } = require('../src/utils/log');

const push = require('../src/commands/push');
const run = require('../src/commands/run');
const createApp = require('../src/commands/createApp');
const troubleshoot = require('../src/commands/troubleshoot');

const { load } = require('../src/loader/worker');

const {
  ErrorAnalyzer,
  errorHelper,
  displayHelp,
} = require('../src/errors/troubleshooting');
const { ConfigLoadIssueAnalyzer } = require('../src/errors/config-load-issue');
const {
  MissingNpmDependencyErrorAnalyzer,
} = require('../src/errors/npm-dependency-issue');
const { NetworkIssueAnalyzer } = require('../src/errors/network-issue');
const {
  AccessDeniedIssueAnalyzer,
} = require('../src/errors/access-denied-issue');

ErrorAnalyzer.register(new ConfigLoadIssueAnalyzer());
ErrorAnalyzer.register(new MissingNpmDependencyErrorAnalyzer());
ErrorAnalyzer.register(new AccessDeniedIssueAnalyzer());
ErrorAnalyzer.register(new NetworkIssueAnalyzer());

function increaseVerbosity(v, total) {
  setVerbosity(total);
  return total + 1;
}

program
  .version(version)
  .option('-u, --platform-url <platform-url>', 'Platform URL')
  .option('-l, --developer-login <developer-login>', 'Developer login')
  .option('-p, --developer-password <developer-password>', 'Developer password')
  .option('-a, --app-name <app-name>', 'Application name')
  .option('-e, --env-name <env-name>', 'Environement name')
  .option(
    '-v, --verbose',
    'Verbosity level (-v=error+warn+info, -vv=error+warn+info+log, -vvv=error+warn+info+log+trace)',
    increaseVerbosity,
    1,
  );

program
  .command('run')
  .usage('[options]')
  .option(
    '-w, --worker <worker>',
    'Push worker on cloud platform',
    identity,
    DEFAULTS.WORKER_FOLDER_PATH,
  )
  .option(
    '-s, --skip-provisioning <skip-provisioning>',
    'Skip provisioning steps',
    Boolean,
    false,
  )
  .description('Run your code')
  .action((command) =>
    createApp(command)
      .then((config) => Promise.all([config, load(command)]))
      .then(([config, declaration]) => {
        run(command, config, declaration);
      })
      .catch((failure) => {
        error('Run failed', failure);
        displayHelp(failure);
      }),
  );

program
  .command('push')
  .usage('[options]')
  .option(
    '-f, --front <front>',
    'Push front on cloud platform',
    identity,
    DEFAULTS.FRONT_FOLDER_PATH,
  )
  .option(
    '-w, --worker <worker>',
    'Push worker on cloud platform',
    identity,
    DEFAULTS.WORKER_FOLDER_PATH,
  )
  .description('Push your application on ZetaPush platform')
  .action((command) =>
    createApp(command)
      .then((config) => Promise.all([config, load(command)]))
      .then(([config, declaration]) => {
        push(command, config, declaration);
      })
      .catch((failure) => {
        error('Push failed', failure);
        displayHelp(failure);
      }),
  );

program
  .command('troubleshoot')
  .arguments('error code')
  .option(
    '-f, --force-refresh',
    'Force refresh of cache',
    () => (errorHelper.refresh = true),
    false,
  )
  .description(
    'Display help to resolve a particular error (ex: NET-01, NET-02, ...)',
  )
  .action((errorCode, command) => {
    troubleshoot(errorCode, command);
  });

program.parse(process.argv);
