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
  beforeEach(async () => {
    this.developerLogin = process.env.ZETAPUSH_DEVELOPER_LOGIN;
    this.developerPassword = process.env.ZETAPUSH_DEVELOPER_PASSWORD;
    // clean
    await rm('.generated-projects/*');
  });

  afterEach(async () => {});

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
      const runner = new Runner('.generated-projects/' + basicWorkerDir);
      runner.run((quiet = false));
      await runner.waitForWorkerUp();
      const zetarc = await readZetarc('.generated-projects/' + basicWorkerDir);
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
      await nukeApp('.generated-projects/' + basicWorkerDir);
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
      const runner = new Runner('.generated-projects/' + brokenWorkerDir);
      runner.run((quiet = false));
      await runner.waitForWorkerUp();
      const zetarc = await readZetarc('.generated-projects/' + brokenWorkerDir);
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
      await nukeApp('.generated-projects/' + brokenWorkerDir);
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
      const runner = new Runner('.generated-projects/' + brokenWorkerInitDir);
      let failure = false;
      try {
        await runner.run((quiet = false));
      } catch (error) {
        failure = true;
      }
      await runner.stop();
      await nukeApp('.generated-projects/' + brokenWorkerInitDir);
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
      const runner = new Runner('.generated-projects/' + exitWorkerDir);
      runner.run((quiet = false));
      await runner.waitForWorkerUp();
      const zetarc = await readZetarc('.generated-projects/' + exitWorkerDir);
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
      await nukeApp('.generated-projects/' + exitWorkerDir);
      expect(helloReceived).toBe(false);
    },
    60 * 1000 * 10,
  );

  /**
   * Clean shutdown on worker hello
   */
  const shutdownWorkerDir = 'shutdown_worker_hello';
  // it(
  //   `Should be able to catch a shutowned worker `,
  //   async () => {
  //     copydir.sync(
  //       'spec/templates/' + shutdownWorkerDir,
  //       '.generated-projects/' + shutdownWorkerDir,
  //     );
  //     createZetarc(
  //       this.developerLogin,
  //       this.developerPassword,
  //       '.generated-projects/' + shutdownWorkerDir,
  //     );
  //     await npmInstallLatestVersion('.generated-projects/' + shutdownWorkerDir);
  //     await zetaPush('.generated-projects/' + shutdownWorkerDir);
  //     zetarc = await readZetarc('.generated-projects/' + shutdownWorkerDir);
  //     this.client = new WeakClient({
  //       ...zetarc,
  //       transports,
  //     });
  //     await this.client.connect();
  //     const api = this.client.createProxyTaskService();
  //     const message = await api.hello();
  //     sleep(1000 * 10);
  //     let helloReceived = false;
  //     const sendHello = async () => {
  //       await api.hello();
  //       helloReceived = true;
  //     };
  //     sendHello();
  //     sleep(5 * 1000);
  //     await nukeApp('.generated-projects/' + shutdownWorkerDir);
  //     expect(helloReceived).toBe(false);
  //   },
  //   60 * 1000 * 30,
  // );
});
