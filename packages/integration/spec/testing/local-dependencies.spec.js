const { given, frontUserAction, autoclean, consoleUserAction, zetaPush } = require('@zetapush/testing');

describe(`As developer with 
      - valid account
      - no configured application
  `, () => {
  afterEach(async () => {
    await autoclean(this);
  });


  describe(`In a local case`, () => {
    /**
     * Functionnal local worker with cloud service local dependencies
     */
    const basicWorkerDir = 'basic_worker_hello_with_local_dep';
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
          /**/ .npmDependencies()
          /*   */ .localProxy('./spec/helpers/false-cloud-service', '../*')
          /*   */ .and()
          /**/ .apply(this);
  
        await frontUserAction('call hello', this, async (api) => {
          let failure = false;
          let result = null;
          try {
            result = await api.hello();
          } catch (error) {
            failure = true;
          }
          await this.context.runner.stop();
          expect(failure).toBe(false);
          expect(result).toEqual("hello");
        });
      },
      60 * 1000 * 10
    );
  });
  describe(`In a zeta push case`, () => {
    /**
     * Functionnal local worker with cloud service local dependencies
     */
    const basicWorkerDir = 'basic_worker_hello_with_local_dep';
    xit(
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
          /**/ .npmDependencies()
          /*   */ .localProxy('./spec/helpers/false-cloud-service', '../*')
          /*   */ .and()
          /**/ .apply(this);

        // // 1) zeta push
        // await consoleUserAction('2) zeta push', async () => {
        //   await zetaPush(basicWorkerDir);
        // });

        // // 2) User action
        // await frontUserAction('3) call hello', this, async (api) => {
        //   let failure = false;
        //   let result = null;
        //   try {
        //     result = await api.hello();
        //   } catch (error) {
        //     failure = true;
        //   }
        //   await this.context.runner.stop();
        //   expect(failure).toBe(false);
        //   expect(result).toEqual("hello");
        // });
      },
      60 * 1000 * 10
    );
  });
});
