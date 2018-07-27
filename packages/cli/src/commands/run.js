const process = require('process');
const ora = require('ora');
const { WorkerRunner, WorkerRunnerEvents } = require('@zetapush/worker');

const troubleshooting = require('../errors/troubleshooting');
const WorkerLoader = require('../loader/worker');
const { createServer } = require('../utils/http-server');
const { log, error, warn, info, trace } = require('@zetapush/core');

/**
 * Run Worker instance
 * @param {Object} command
 * @param {Object} config
 * @param {WorkerDeclaration} declaration
 */
const run = (command, config, declaration) => {
  const runner = new WorkerRunner(
    command.skipProvisionning,
    command.skipBootstrap,
    config,
  );
  const spinner = ora('Starting worker... \n');

  runner.on(WorkerRunnerEvents.BOOTSTRAPING, ({ client }) => {
    trace('Bootstraping worker...');
    listenTerminalSignals(client, runner);
  });
  runner.on(WorkerRunnerEvents.UPLOADED, ({ recipe }) =>
    log('Uploaded', recipe.recipeId),
  );
  runner.on(WorkerRunnerEvents.QUEUE_SERVICE_DEPLOYING, () =>
    log('Waiting Queue service deploying...'),
  );
  runner.on(WorkerRunnerEvents.QUEUE_SERVICE_READY, ({ recipe }) =>
    log(`Queue service ready on ${recipe.recipeId}`),
  );
  // runner.on(WorkerRunnerEvents.CONNECTING);
  runner.on(WorkerRunnerEvents.CONNECTED, () => log(`Connected`));
  runner.on(WorkerRunnerEvents.CREATED_SERVICES, ({ services }) =>
    info(`Create services`, services),
  );
  runner.on(WorkerRunnerEvents.PLATFORM_SERVICES_READY, () =>
    log(`Platform services created`),
  );
  runner.on(WorkerRunnerEvents.STARTING, () => {
    trace('Starting worker...');
    spinner.start();
  });
  runner.on(WorkerRunnerEvents.STARTED, () => {
    spinner.stop();
    info('Worker is up!');
  });
  runner.on(WorkerRunnerEvents.RELOADING, () => {
    spinner.text = `Reloading worker... \n`;
    spinner.start();
  });
  runner.on(WorkerRunnerEvents.RELOADED, () => {
    spinner.stop();
    info('Worker is up!');
  });
  runner.on(WorkerRunnerEvents.UPLOAD_FAILED, ({ failure }) => {
    error('Upload failed', failure);
  });
  runner.on(WorkerRunnerEvents.START_FAILED, ({ failure }) => {
    runner.destroy();
    spinner.stop();
    error('Failed to start worker', failure);
    troubleshooting.displayHelp(failure);
  });
  runner.on(WorkerRunnerEvents.RELOAD_FAILED, ({ failure }) => {
    spinner.stop();
    warn('Fail to reload worker');
  });

  WorkerLoader.events.on('reload', (reloaded) => {
    runner.reload(reloaded).catch((failure) => {
      runner.destroy();
      spinner.stop();
      error('ZetaPush Celtia Error', failure);
      troubleshooting.displayHelp(failure);
    });
  });

  runner.run(declaration);
  if (command.serveFront) {
    return createServer(command, config);
  }
};

const listenTerminalSignals = (client, runner) => {
  const onTerminalSignal = () => {
    runner.destroy();
    warn(`Properly disconnect client`);
    client.disconnect().then(() => {
      warn(`Client properly disconnected`);
      process.exit(0);
    });
  };

  const TERMINATE_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  TERMINATE_SIGNALS.forEach((signal) => {
    process.on(signal, () => {
      onTerminalSignal(signal);
    });
  });
};

module.exports = run;
