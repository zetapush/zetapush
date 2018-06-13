#!/usr/bin/env node

const program = require('commander');

const { version } = require('../package.json');

const DEFAULTS = require('../src/utils/defaults');
const {
  helpMessageRun,
  helpMessagePush,
} = require('../src/utils/helper-messages');
const { setVerbosity, help, error } = require('../src/utils/log');

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
  .option('-w, --worker', 'Run worker on local platform')
  .option('-s, --skip-provisioning', 'Skip provisioning steps', false)
  .arguments('[basepath]')
  .description('Run your code')
  .action((basepath = DEFAULTS.CURRENT_WORKING_DIRECTORY, command) =>
    createApp(basepath, command)
      .then((config) => Promise.all([config, load(basepath)]))
      .then(([config, declaration]) => {
        run(command, basepath, config, declaration);
      })
      .catch((failure) => {
        error('Run failed', failure);
        displayHelp(failure);
      }),
  )
  .on('--help', function() {
    console.log(helpMessageRun());
  });

program
  .command('push')
  .option('-f, --front', 'Push front on cloud platform')
  .option('-w, --worker', 'Push worker on cloud platform')
  .arguments('[basepath]')
  .description('Push your application on ZetaPush platform')
  .action((basepath = DEFAULTS.CURRENT_WORKING_DIRECTORY, command) =>
    createApp(basepath, command)
      .then((config) => Promise.all([config, load(basepath)]))
      .then(([config, declaration]) => {
        push(command.parent, basepath, config, declaration);
      })
      .catch((failure) => {
        error('Push failed', failure);
        displayHelp(failure);
      }),
  )
  .on('--help', function() {
    console.log(helpMessagePush());
  });

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
