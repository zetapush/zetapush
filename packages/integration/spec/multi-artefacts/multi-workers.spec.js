const { given, autoclean, zetaRun, readZetarc } = require('@zetapush/testing');
const { consoleAction, frontAction } = require('@zetapush/testing');
const patternWorker = /Hello World from worker/;
const patternWorker1 = /Hello World from worker1/;
const patternWorker2 = /Hello World from worker2/;

describe(`As developer with
      - valid account
      - no configured application
      - multiple workers
  `, () => {
  const appDir = 'multi-workers';

  afterEach(async () => {
    await autoclean(this);
  });

  describe(`In the "zeta run" context when we specify multiple workers`, () => {
    it(
      `should be able to
      - have a new hello-world project
      - run the hello-world
      - call hello1() and hello2() from the exposed workers`,
      async () => {
        //  1) Given
        await given()
          /**/ .credentials()
          /*  */ .fromEnv()
          /*  */ .and()
          /**/ .project()
          /*  */ .template()
          /*    */ .sourceDir(appDir)
          /*    */ .and()
          /*  */ .and()
          /**/ .worker()
          /*  */ .up('--workers myWorker2,myWorker1')
          /*  */ .and()
          /**/ .npm()
          /*   */ .dependencies()
          /*     */ .module('@zetapush/core')
          /*       */ .and()
          /*     */ .module('@zetapush/cli')
          /*       */ .and()
          /*     */ .and()
          /*   */ .and()
          /**/ .apply(this);

        // 2) call worker1
        await frontAction(this)
          .name('2) call worker 1')
          .deploymentId('myWorker1')
          .execute(async (api) => {
            const message1 = await api.hello1();
            expect(typeof message1).toBe('string');
            expect(patternWorker1.test(message1)).toBe(true);
          });

        // 3) call worker2
        await frontAction(this)
          .name('3) call worker 2')
          .deploymentId('myWorker2')
          .execute(async (api) => {
            const message2 = await api.hello2();
            expect(typeof message2).toBe('string');
            expect(patternWorker2.test(message2)).toBe(true);
          });
      },
      10 * 60 * 1000
    );
  });

  describe(`In the "zeta run" context when we specify one worker`, () => {
    it(
      `should be able to
      - have a new hello-world project
      - run the hello-world
      - call hello2() from the exposed worker`,
      async () => {
        //  1) Given
        await given()
          /**/ .credentials()
          /*  */ .fromEnv()
          /*  */ .and()
          /**/ .project()
          /*  */ .template()
          /*    */ .sourceDir(appDir)
          /*    */ .and()
          /*  */ .and()
          /**/ .worker()
          /*  */ .up('--worker myWorker2')
          /*  */ .and()
          /**/ .npm()
          /*   */ .dependencies()
          /*     */ .module('@zetapush/core')
          /*       */ .and()
          /*     */ .module('@zetapush/cli')
          /*       */ .and()
          /*     */ .and()
          /*   */ .and()
          /**/ .apply(this);

        // 2) call worker2
        await frontAction(this)
          .name('2) call worker 2')
          .deploymentId('myWorker2')
          .execute(async (api) => {
            const message2 = await api.hello2();
            expect(typeof message2).toBe('string');
            expect(patternWorker2.test(message2)).toBe(true);
          });
      },
      10 * 60 * 1000
    );
  });

  describe(`In the "zeta run" context without specifing worker`, () => {
    it(
      `should be able to
      - have a new hello-world project
      - run the hello-world
      - call hello() from the exposed worker`,
      async () => {
        //  1) Given
        await given()
          /**/ .credentials()
          /*  */ .fromEnv()
          /*  */ .and()
          /**/ .project()
          /*  */ .template()
          /*    */ .sourceDir(appDir)
          /*    */ .and()
          /*  */ .and()
          /**/ .worker()
          /*  */ .up()
          /*  */ .and()
          /**/ .npm()
          /*   */ .dependencies()
          /*     */ .module('@zetapush/core')
          /*       */ .and()
          /*     */ .module('@zetapush/cli')
          /*       */ .and()
          /*     */ .and()
          /*   */ .and()
          /**/ .apply(this);

        // 2) call worker
        await frontAction(this)
          .name('2) call worker')
          .execute(async (api) => {
            const message = await api.hello();
            expect(typeof message).toBe('string');
            expect(patternWorker.test(message)).toBe(true);
          });
      },
      10 * 60 * 1000
    );
  });

  describe(`In the "zeta push" context in the default case`, () => {
    it(
      `should be able to
      - have a new hello-world project
      - run the hello-world
      - call hello1() from the exposed worker1`,
      async () => {
        //  1) Given
        await given()
          /**/ .credentials()
          /*  */ .fromEnv()
          /*  */ .and()
          /**/ .project()
          /*  */ .template()
          /*    */ .sourceDir(appDir)
          /*    */ .and()
          /*  */ .and()
          /**/ .worker()
          /*  */ .pushed('--workers myWorker2,myWorker1')
          /*  */ .and()
          /**/ .npm()
          /*   */ .dependencies()
          /*     */ .module('@zetapush/core')
          /*       */ .and()
          /*     */ .module('@zetapush/cli')
          /*       */ .and()
          /*     */ .and()
          /*   */ .and()
          /**/ .apply(this);

        // 3) check worker 1
        await frontAction(this)
          .name('3) call worker 1')
          .deploymentId('myWorker1')
          .execute(async (api) => {
            const message = await api.hello1();
            expect(typeof message).toBe('string');
            expect(patternWorker1.test(message)).toBe(true);
          });

        // 4) check worker 2
        await frontAction(this)
          .name('4) call worker 2')
          .deploymentId('myWorker2')
          .execute(async (api) => {
            const message = await api.hello2();
            expect(typeof message).toBe('string');
            expect(patternWorker2.test(message)).toBe(true);
          });
      },
      10 * 60 * 1000
    );
  });

  describe(`In the "zeta push" context when we specify a worker`, () => {
    it(
      `should be able to
      - have a new hello-world project
      - run the hello-world
      - call hello2() from the exposed worker2`,
      async () => {
        //  1) Given
        await given()
          /**/ .credentials()
          /*  */ .fromEnv()
          /*  */ .and()
          /**/ .project()
          /*  */ .template()
          /*    */ .sourceDir(appDir)
          /*    */ .and()
          /*  */ .and()
          /**/ .worker()
          /*  */ .pushed('--worker myWorker2')
          /*  */ .and()
          /**/ .npm()
          /*   */ .dependencies()
          /*     */ .module('@zetapush/core')
          /*       */ .and()
          /*     */ .module('@zetapush/cli')
          /*       */ .and()
          /*     */ .and()
          /*   */ .and()
          /**/ .apply(this);

        // 3) check using a client
        await frontAction(this)
          .name('3) call worker 2')
          .deploymentId('myWorker2')
          .execute(async (api) => {
            const message = await api.hello2();
            expect(typeof message).toBe('string');
            expect(patternWorker2.test(message)).toBe(true);
          });
      },
      10 * 60 * 1000
    );
  });

  describe(`In the "zeta push" context without specifing worker`, () => {
    it(
      `should be able to
      - have a new hello-world project
      - run the hello-world
      - call hello() from the exposed worker`,
      async () => {
        //  1) Given
        await given()
          /**/ .credentials()
          /*  */ .fromEnv()
          /*  */ .and()
          /**/ .project()
          /*  */ .template()
          /*    */ .sourceDir(appDir)
          /*    */ .and()
          /*  */ .and()
          /**/ .worker()
          /*  */ .pushed()
          /*  */ .and()
          /**/ .npm()
          /*   */ .dependencies()
          /*     */ .module('@zetapush/core')
          /*       */ .and()
          /*     */ .module('@zetapush/cli')
          /*       */ .and()
          /*     */ .and()
          /*   */ .and()
          /**/ .apply(this);

        // 2) check using a client
        await frontAction(this)
          .name('2) call worker')
          .execute(async (api) => {
            const message = await api.hello();
            expect(typeof message).toBe('string');
            expect(patternWorker.test(message)).toBe(true);
          });
      },
      10 * 60 * 1000
    );
  });
});
