#!/usr/bin/env node

// FirstClass TypeScript Support
require('ts-node').register({
  ignore: '/node_modules/'
});

const program = require('commander');

const { version } = require('../package.json');

const { DEFAULTS, setVerbosity, error } = require('@zetapush/common');
const {
  ErrorAnalyzer,
  errorHelper,
  displayHelp,
  ConfigLoadIssueAnalyzer,
  MissingNpmDependencyErrorAnalyzer,
  NetworkIssueAnalyzer,
  AccessDeniedIssueAnalyzer,
  InjectionIssueAnalyzer,
  CustomCloudServiceStartErrorAnalyzer,
  OnApplicationBoostrapErrorAnalyser,
  WorkerRegisterErrorAnalyser
} = require('@zetapush/troubleshooting');

const { helpMessageRun, helpMessagePush } = require('../src/utils/helper-messages');
const { identity } = require('../src/utils/validator');

const push = require('../src/commands/push');
const run = require('../src/commands/run');
const createApp = require('../src/commands/createApp');
const troubleshoot = require('../src/commands/troubleshoot');

const { load } = require('../src/loader/worker');

ErrorAnalyzer.register(new ConfigLoadIssueAnalyzer());
ErrorAnalyzer.register(new NetworkIssueAnalyzer());
ErrorAnalyzer.register(new AccessDeniedIssueAnalyzer());
ErrorAnalyzer.register(new InjectionIssueAnalyzer());
ErrorAnalyzer.register(new MissingNpmDependencyErrorAnalyzer());
ErrorAnalyzer.register(new CustomCloudServiceStartErrorAnalyzer());
ErrorAnalyzer.register(new OnApplicationBoostrapErrorAnalyser());
ErrorAnalyzer.register(new WorkerRegisterErrorAnalyser());

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
  .option('-e, --env-name <env-name>', 'Environment name')
  .option(
    '-v, --verbose',
    'Verbosity level (-v=error+warn+info, -vv=error+warn+info+log, -vvv=error+warn+info+log+trace)',
    increaseVerbosity,
    1
  );

program
  .command('run')
  .usage('[options]')
  .option('-f, --front <front>', 'Push front on cloud platform', identity, DEFAULTS.FRONT_FOLDER_PATH)
  .option('-w, --worker <worker>', 'Push worker on cloud platform', identity, DEFAULTS.WORKER_FOLDER_PATH)
  .option('-s, --skip-provisioning', 'Skip provisioning steps', () => true, false)
  .option('--grab-all-traffic', 'Grab all traffic (requests) to local worker', () => true, false)
  .option('--serve-front', 'Run local http server to serve your front code', () => true, false)
  .option('--skip-bootstrap', 'Discard all onApplicationBootstrap methods on run', () => true, false)
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
      })
  )
  .on('--help', () => {
    console.log(helpMessageRun());
  });

program
  .command('push')
  .usage('[options]')
  .option('-f, --front <front>', 'Push front on cloud platform', identity, DEFAULTS.FRONT_FOLDER_PATH)
  .option('-w, --worker <worker>', 'Push worker on cloud platform', identity, DEFAULTS.WORKER_FOLDER_PATH)
  .option('-r, --registry <registry>', 'Specify a npm registry url', identity, DEFAULTS.NPM_REGISTRY_URL)
  .option('-si --ts-node-skip-ignore', 'Skip ignore for ts-node transpilation', identity, DEFAULTS.TS_NODE_SKIP_IGNORE)
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
      })
  )
  .on('--help', () => {
    console.log(helpMessagePush());
  });

program
  .command('troubleshoot')
  .arguments('error code')
  .option('-f, --force-refresh', 'Force refresh of cache', () => (errorHelper.refresh = true), false)
  .description('Display help to resolve a particular error (ex: NET-01, NET-02, ...)')
  .action((errorCode, command) => {
    troubleshoot(errorCode, command);
  });

program.parse(process.argv);
