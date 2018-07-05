const { WeakClient } = require('@zetapush/core');
const transports = require('@zetapush/cometd/lib/node/Transports');
const {
  rm,
  npmInit,
  zetaPush,
  readZetarc,
  Runner,
  createZetarc,
  npmInstallLatestVersion,
  nukeApp,
} = require('./utils/commands');
const PATTERN = /Hello World from JavaScript (\d+)/;
const fs = require('fs');
const copydir = require('copy-dir');

const sleep = (millis) => {
  return new Promise((resolve) => setTimeout(resolve, millis));
};

describe(`As developer with 
      - valid account
      - no configured application
  `, () => {
  const projectDir = 'project-nominal-case';

  beforeEach(async () => {
    this.developerLogin = process.env.ZETAPUSH_DEVELOPER_LOGIN;
    this.developerPassword = process.env.ZETAPUSH_DEVELOPER_PASSWORD;
    // clean
    await rm('.generated-projects/*');
  });

  /**
   * Functionnal local worker
   */
  const basicWorkerDir = 'basic_worker_hello';
  it(
    `Should be able to launch a local worker and call hello CCS`,
    async () => {
      copydir.sync(
        'spec/templates/' + basicWorkerDir,
        '.generated-projects/' + basicWorkerDir,
      );
      createZetarc(
        this.developerLogin,
        this.developerPassword,
        '.generated-projects/' + basicWorkerDir,
      );
      const runner = new Runner(basicWorkerDir);
      runner.run((quiet = false));
      await runner.waitForWorkerUp();
      const zetarc = await readZetarc(basicWorkerDir);
      this.client = new WeakClient({
        ...zetarc,
        transports,
      });
      await this.client.connect();
      const api = this.client.createProxyTaskService();
      let failure = false;
      try {
        await api.hello();
      } catch (error) {
        failure = true;
      }
      await runner.stop();
      await nukeApp(basicWorkerDir);
      expect(failure).toBe(false);
    },
    60 * 1000 * 10,
  );

  /**
   * Broken local worker CCS call
   */
  const brokenWorkerDir = 'broken_worker_hello';
  it(
    `Should be able to catch a broken CCS exception`,
    async () => {
      copydir.sync(
        'spec/templates/' + brokenWorkerDir,
        '.generated-projects/' + brokenWorkerDir,
      );
      createZetarc(
        this.developerLogin,
        this.developerPassword,
        '.generated-projects/' + brokenWorkerDir,
      );
      const runner = new Runner(brokenWorkerDir);
      runner.run((quiet = false));
      await runner.waitForWorkerUp();
      const zetarc = await readZetarc(brokenWorkerDir);
      this.client = new WeakClient({
        ...zetarc,
        transports,
      });
      await this.client.connect();
      const api = this.client.createProxyTaskService();
      let failure = false;
      try {
        await api.hello();
      } catch (error) {
        failure = true;
      }
      await runner.stop();
      await nukeApp(brokenWorkerDir);
      expect(failure).toBe(true);
    },
    60 * 1000 * 2,
  );

  /**
   * Broken local worker init
   */
  const brokenWorkerInitDir = 'broken_worker_init';
  it(
    `Should be able to catch a broken worker init`,
    async () => {
      copydir.sync(
        'spec/templates/' + brokenWorkerInitDir,
        '.generated-projects/' + brokenWorkerInitDir,
      );
      createZetarc(
        this.developerLogin,
        this.developerPassword,
        '.generated-projects/' + brokenWorkerInitDir,
      );
      const runner = new Runner(brokenWorkerInitDir);
      let failure = false;
      try {
        await runner.run((quiet = false));
      } catch (error) {
        failure = true;
      }
      await runner.stop();
      await nukeApp(brokenWorkerInitDir);
      expect(failure).toBe(true);
    },
    60 * 1000 * 10,
  );

  /**
   * Exit(0) when hello CCS call
   */
  const exitWorkerDir = 'exit_worker_hello';
  it(
    `Should be able to catch an exit CCS `,
    async () => {
      copydir.sync(
        'spec/templates/' + exitWorkerDir,
        '.generated-projects/' + exitWorkerDir,
      );
      createZetarc(
        this.developerLogin,
        this.developerPassword,
        '.generated-projects/' + exitWorkerDir,
      );
      const runner = new Runner(exitWorkerDir);
      runner.run((quiet = false));
      await runner.waitForWorkerUp();
      const zetarc = await readZetarc(exitWorkerDir);
      this.client = new WeakClient({
        ...zetarc,
        transports,
      });
      await this.client.connect();
      const api = this.client.createProxyTaskService();
      let helloReceived = false;
      const sendHello = async () => {
        await api.hello();
        console.log('RECEIVED');
        helloReceived = true;
      };
      sendHello();
      await sleep(5000);
      await runner.stop();
      await nukeApp(exitWorkerDir);
      expect(helloReceived).toBe(false);
    },
    60 * 1000 * 10,
  );

  /**
   * Clean shutdown on worker hello
   */
  const shutdownWorkerDir = 'shutdown_worker_hello';
  it(
    `Should be able to catch a shutowned worker `,
    async () => {
      copydir.sync(
        'spec/templates/' + shutdownWorkerDir,
        '.generated-projects/' + shutdownWorkerDir,
      );
      createZetarc(
        this.developerLogin,
        this.developerPassword,
        '.generated-projects/' + shutdownWorkerDir,
      );
      await npmInstall(shutdownWorkerDir);
      await zetaPush(shutdownWorkerDir);

      zetarc = await readZetarc(shutdownWorkerDir);
      this.client = new WeakClient({
        ...zetarc,
        transports,
      });
      await this.client.connect();
      const api = this.client.createProxyTaskService();
      const message = await api.hello();
      sleep(1000 * 10);

      let helloReceived = false;
      const sendHello = async () => {
        await api.hello();
        helloReceived = true;
      };
      sendHello();
      sleep(5 * 1000);
      await nukeApp('.generated-projects/' + shutdownWorkerDir);
      expect(helloReceived).toBe(false);
    },
    60 * 1000 * 30,
  );
});
