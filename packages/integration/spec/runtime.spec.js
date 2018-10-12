const { given, frontAction, autoclean } = require('@zetapush/testing');
const { TimeoutError } = require('@zetapush/client');

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

      await frontAction(this)
        .name('call hello')
        .execute(async (api) => {
          let failure = false;
          try {
            await api.hello();
          } catch (error) {
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

      await frontAction(this)
        .name('call hello')
        .execute(async (api) => {
          let failure = false;
          try {
            await api.hello();
          } catch (error) {
            failure = true;
          }
          await this.context.runner.stop();
          expect(failure).toBe(true);
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
        failure = true;
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

      await frontAction(this)
        .name('call hello')
        .execute(async (api) => {
          try {
            const sendHello = async () => {
              // hello function in worker exits the worker => no answer will be received so promise won't be resolved
              await api.hello();
              fail('Should not have received the request as the worker has exited');
            };
            await sendHello();
            fail('Should have failed with timeout');
          } catch (e) {
            expect(() => {
              throw e;
            }).toThrowError(TimeoutError);
          }
        });
    },
    60 * 1000 * 10
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
