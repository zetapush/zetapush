const { given, frontAction, autoclean, modules } = require('@zetapush/testing');

describe(`As developer with 
      - valid account
      - no configured application
  `, () => {
  afterEach(async () => {
    await autoclean(this);
  });

  const basicWorkerDir = 'basic_worker_hello_with_local_dep';

  describe(`Using modules with module().useSources() syntax`, () => {
    describe(`In a local case`, () => {
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
            /**/ .npm()
            /*   */ .dependencies()
            /*     */ .module('fake-npm-lib')
            /*       */ .useSources('./spec/templates/fake-npm-lib')
            /*         */ .and()
            /*       */ .and()
            /*     */ .module('@zetapush/core')
            /*       */ .useSources('../core')
            /*         */ .and()
            /*       */ .and()
            /*     */ .and()
            /*   */ .and()
            /**/ .apply(this);

          await frontAction('call hello', this, async (api) => {
            let failure = false;
            let result = null;
            try {
              result = await api.hello();
            } catch (error) {
              failure = true;
            }
            await this.context.runner.stop();
            expect(failure).toBe(false);
            expect(result).toEqual('hello');
          });
        },
        60 * 1000 * 10
      );
    });
    describe(`In a zeta push case`, () => {
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
            /*   */ .pushed()
            /*   */ .and()
            /**/ .npm()
            /*   */ .dependencies()
            /*     */ .module('fake-npm-lib')
            /*       */ .useSources('./spec/templates/fake-npm-lib')
            /*         */ .and()
            /*       */ .and()
            /*     */ .module('@zetapush/core')
            /*       */ .useSources('../core')
            /*         */ .and()
            /*       */ .and()
            /*     */ .and()
            /*   */ .and()
            /**/ .apply(this);

          await frontAction('2) call hello', this, async (api) => {
            let failure = false;
            let result = null;
            try {
              result = await api.hello();
            } catch (error) {
              failure = true;
            }
            expect(failure).toBe(false);
            expect(result).toEqual('hello');
          });
        },
        60 * 1000 * 10
      );
    });
  });

  describe(`Using modules with modules() syntax`, () => {
    const myLocalModules = modules()
      /*                 */ .module('fake-npm-lib')
      /*                   */ .useSources('./spec/templates/fake-npm-lib')
      /*                     */ .and()
      /*                   */ .and()
      /*                 */ .module('@zetapush/core')
      /*                   */ .useSources('../core')
      /*                     */ .and()
      /*                   */ .and()
      /*                 */ .apply();

    describe(`In a local case`, () => {
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
            /**/ .npm()
            /*   */ .dependencies()
            /*     */ .modules(myLocalModules)
            /*     */ .and()
            /*   */ .and()
            /**/ .apply(this);

          await frontAction('call hello', this, async (api) => {
            let failure = false;
            let result = null;
            try {
              result = await api.hello();
            } catch (error) {
              failure = true;
            }
            await this.context.runner.stop();
            expect(failure).toBe(false);
            expect(result).toEqual('hello');
          });
        },
        60 * 1000 * 10
      );
    });

    describe(`In a zeta push case`, () => {
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
            /*   */ .pushed()
            /*   */ .and()
            /**/ .npm()
            /*   */ .dependencies()
            /*     */ .modules(myLocalModules)
            /*     */ .and()
            /*   */ .and()
            /**/ .apply(this);

          await frontAction('2) call hello', this, async (api) => {
            let failure = false;
            let result = null;
            try {
              result = await api.hello();
            } catch (error) {
              failure = true;
            }
            expect(failure).toBe(false);
            expect(result).toEqual('hello');
          });
        },
        60 * 1000 * 10
      );
    });
  });
  describe(`Using modules with module().useSources() syntax and without specify sources for zetapush package`, () => {
    describe(`In a local case`, () => {
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
            /**/ .npm()
            /*   */ .dependencies()
            /*     */ .module('fake-npm-lib')
            /*       */ .useSources('./spec/templates/fake-npm-lib')
            /*         */ .and()
            /*       */ .and()
            /*     */ .module('@zetapush/core')
            /*       */ .and()
            /*     */ .and()
            /*   */ .and()
            /**/ .apply(this);

          await frontAction('call hello', this, async (api) => {
            let failure = false;
            let result = null;
            try {
              result = await api.hello();
            } catch (error) {
              failure = true;
            }
            await this.context.runner.stop();
            expect(failure).toBe(false);
            expect(result).toEqual('hello');
          });
        },
        60 * 1000 * 10
      );
    });
    describe(`In a zeta push case`, () => {
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
            /*   */ .pushed()
            /*   */ .and()
            /**/ .npm()
            /*   */ .dependencies()
            /*     */ .module('fake-npm-lib')
            /*       */ .useSources('./spec/templates/fake-npm-lib')
            /*         */ .and()
            /*       */ .and()
            /*     */ .module('@zetapush/core')
            /*       */ .and()
            /*     */ .and()
            /*   */ .and()
            /**/ .apply(this);

          await frontAction('2) call hello', this, async (api) => {
            let failure = false;
            let result = null;
            try {
              result = await api.hello();
            } catch (error) {
              failure = true;
            }
            expect(failure).toBe(false);
            expect(result).toEqual('hello');
          });
        },
        60 * 1000 * 10
      );
    });
  });
});
