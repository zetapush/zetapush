const { given, frontUserAction, autoclean } = require('@zetapush/testing');

const sleep = (millis) => {
  return new Promise((resolve) => setTimeout(resolve, millis));
};

describe(`As developer with 
      - valid account
      - no configured application
  `, () => {
  afterEach(async () => {
    await autoclean(this);
  });

  /**
   * Functionnal local worker
   */
  const basicWorkerDir = 'basic_worker_hello';
  it(
    `Should be able to launch a local worker and call hello CCS`,
    async () => {
      await given()
        /**/ .credentials()
        /*   */ .fromEnv()
        /*   */ .and()
        /**/ .project()
        /*   */ .template()
        /*     */ .sourceDir(basicWorkerDir)
        /*     */ .and()
        /*   */ .and()
        /**/ .worker()
        /*   */ .up()
        /*   */ .and()
        /**/ .apply(this);

      await frontUserAction('call hello', this, async (api) => {
        let failure = false;
        try {
          const res = await api.hello();
          if (res !== 'Hello') throw 'Hello was expected, got ' + res + 'instead';
        } catch (error) {
          console.log(ferror);
          failure = true;
        }
        await this.context.runner.stop();
        expect(failure).toBe(false);
      });
    },
    60 * 1000 * 10
  );

  /**
   * Broken local worker CCS call
   */
  const brokenWorkerDir = 'broken_worker_hello';
  it(
    `Should be able to catch a broken CCS exception`,
    async () => {
      await given()
        /**/ .credentials()
        /*   */ .fromEnv()
        /*   */ .and()
        /**/ .project()
        /*   */ .template()
        /*     */ .sourceDir(brokenWorkerDir)
        /*     */ .and()
        /*   */ .and()
        /**/ .worker()
        /*   */ .up()
        /*   */ .and()
        /**/ .apply(this);

      await frontUserAction('call hello', this, async (api) => {
        let failureCSS = false;
        try {
          await api.hello();
        } catch (error) {
          if (error.message === 'CCS hello error') failureCSS = true;
        }
        await this.context.runner.stop();
        expect(failureCSS).toBe(true);
      });
    },
    60 * 1000 * 2
  );

  /**
   * Broken local worker init
   */
  const brokenWorkerInitDir = 'broken_worker_init';
  it(
    `Should be able to catch a broken worker init`,
    async () => {
      await given()
        /**/ .credentials()
        /*   */ .fromEnv()
        /*   */ .and()
        /**/ .project()
        /*   */ .template()
        /*     */ .sourceDir(brokenWorkerInitDir)
        /*     */ .and()
        /*   */ .and()
        /**/ .worker()
        /*   */ .runner()
        /*   */ .and()
        /**/ .apply(this);

      // worker can't start due to runtime error
      let failure = false;
      try {
        await this.context.runner.run();
      } catch (error) {
        if (error.code == 235) failure = true;
      }
      expect(failure).toBe(true);
    },
    60 * 1000 * 10
  );

  /**
   * Exit(0) when hello CCS call
   */
  const exitWorkerDir = 'exit_worker_hello';
  it(
    `Should be able to catch an exit CCS `,
    async () => {
      await given()
        /**/ .credentials()
        /*   */ .fromEnv()
        /*   */ .and()
        /**/ .project()
        /*   */ .template()
        /*     */ .sourceDir(exitWorkerDir)
        /*     */ .and()
        /*   */ .and()
        /**/ .worker()
        /*   */ .up()
        /*   */ .and()
        /**/ .apply(this);

      await frontUserAction('call hello', this, async (api) => {
        let helloReceived = false;
        const sendHello = async () => {
          // hello function in worker exits the worker => no answer will be received so promise won't be resolved
          await api.hello();
          console.log('RECEIVED');
          helloReceived = true;
        };
        sendHello();
        await sleep(5000);
        await this.context.runner.stop();
        expect(helloReceived).toBe(false);
      });
    },
    60 * 1000 * 10
  );

  // These test will be possibles once Runner.waitForWorkerUp() will wait for all onApplicationBoostrap ended

  // /**
  //  * Functionnal Bootstrap with GDA
  //  */
  // const bootstrapWorkerDir = 'bootstrap_with_gda';
  // it(
  //   `Should be able to do create one gda Table one bootstrap, then use it `,
  //   async () => {
  //     await given()
  //       /**/ .credentials()
  //       /*   */ .fromEnv()
  //       /*   */ .and()
  //       /**/ .project()
  //       /*   */ .template()
  //       /*     */ .sourceDir(bootstrapWorkerDir)
  //       /*     */ .and()
  //       /*   */ .and()
  //       /**/ .worker()
  //       /*   */ .up()
  //       /*   */ .and()
  //       /**/ .apply(this);

  //     await frontUserAction('call hello', this, async (api) => {
  //       const res = await api.hello();
  //       expect(res.test).toBe('Python is better');
  //     });
  //   },
  //   60 * 1000 * 10
  // );

  // /**
  //  * Not functionnal Bootstrap
  //  */
  // const bootstrapWorkerDir = 'broken_bootstrap';
  // it(
  //   `Should be able to catch a bootstrap error`,
  //   async () => {
  //     await given()
  //       /**/ .credentials()
  //       /*   */ .fromEnv()
  //       /*   */ .and()
  //       /**/ .project()
  //       /*   */ .template()
  //       /*     */ .sourceDir(bootstrapWorkerDir)
  //       /*     */ .and()
  //       /*   */ .and()
  //       /**/ .worker()
  //       /*   */ .up()
  //       /*   */ .and()
  //       /**/ .apply(this);

  //   },
  //   60 * 1000 * 10
  // );

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
