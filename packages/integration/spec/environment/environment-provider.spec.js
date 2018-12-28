const { given, autoclean, frontAction } = require('@zetapush/testing');

describe(`Injected environment`, () => {
  afterEach(async () => {
    await autoclean(this);
  });

  describe(`with zeta run`, () => {
    describe(`--serve-front`, () => {
      beforeEach(async () => {
        await given()
          /**/ .credentials()
          /*  */ .fromEnv()
          /*  */ .and()
          /**/ .project()
          /*  */ .template()
          /*    */ .sourceDir('environment-provider')
          /*    */ .and()
          /*  */ .and()
          /**/ .worker()
          /*  */ .up()
          /*  */ .and()
          /**/ .front()
          /*  */ .serve()
          /*  */ .and()
          /**/ .apply(this);
      }, 10 * 60 * 1000);

      it(`injects both front and worker local urls`, async () => {
        await frontAction(this)
          .name('check injected urls')
          .execute(async (api) => {
            const frontUrl = await api.getFrontUrl();
            expect(frontUrl).toBeDefined();
            expect(frontUrl).toBe('http://localhost:3000');

            const workerUrl = await api.getWorkerUrl();
            expect(workerUrl).toBeDefined();
            expect(workerUrl).toBe('http://localhost:2999');
          });
      });
    });

    describe(`(worker only)`, () => {
      beforeEach(async () => {
        await given()
          /**/ .credentials()
          /*  */ .fromEnv()
          /*  */ .and()
          /**/ .project()
          /*  */ .template()
          /*    */ .sourceDir('environment-provider')
          /*    */ .and()
          /*  */ .and()
          /**/ .worker()
          /*  */ .up()
          /*  */ .and()
          /**/ .apply(this);
      }, 10 * 60 * 1000);

      it(`injects local worker url`, async () => {
        await frontAction(this)
          .name('check injected urls')
          .execute(async (api) => {
            const frontUrl = await api.getFrontUrl();
            // FIXME: API returns null so front should also receive null (see #182)
            // expect(frontUrl).toBeNull();
            expect(frontUrl).toBeUndefined();

            const workerUrl = await api.getWorkerUrl();
            expect(workerUrl).toBeDefined();
            expect(workerUrl).toBe('http://localhost:2999');
          });
      });
    });
  });

  describe(`with zeta push`, () => {
    beforeEach(async () => {
      await given()
        /**/ .credentials()
        /*  */ .fromEnv()
        /*  */ .and()
        /**/ .project()
        /*  */ .template()
        /*    */ .sourceDir('environment-provider')
        /*    */ .and()
        /*  */ .and()
        /**/ .worker()
        /*  */ .pushed()
        /*  */ .and()
        /**/ .npm()
        /*   */ .dependencies()
        /*     */ .module('@zetapush/core')
        /*       */ .and()
        /*     */ .module('@zetapush/common')
        /*       */ .and()
        /*     */ .module('@zetapush/worker')
        /*       */ .and()
        /*     */ .module('@zetapush/client')
        /*       */ .and()
        /*     */ .module('@zetapush/cometd')
        /*       */ .and()
        /*     */ .module('@zetapush/cli')
        /*       */ .and()
        /*     */ .and()
        /*   */ .and()
        /**/ .front()
        /*  */ .pushed()
        /*  */ .and()
        /**/ .apply(this);
    }, 10 * 60 * 1000);

    xit(`injects both front and worker cloud urls`, async () => {
      await frontAction(this)
        .name('check injected urls')
        .execute(async (api) => {
          const frontUrl = await api.getFrontUrl();
          expect(frontUrl).toBeDefined();
          expect(frontUrl).not.toBe('http://localhost:3000');

          const workerUrl = await api.getWorkerUrl();
          expect(workerUrl).toBeDefined();
          expect(workerUrl).not.toBe('http://localhost:2999');
        });
    });
  });
});
