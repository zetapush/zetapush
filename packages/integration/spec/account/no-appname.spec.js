const { zetaPush, readZetarc } = require('@zetapush/testing');
const PATTERN = /Hello World from JavaScript (\d+)/;
const { given, consoleUserAction, frontUserAction, autoclean } = require('@zetapush/testing');

describe(`As developer with
        - account exists
        - no appName
    `, () => {
  afterEach(async () => {
    await autoclean(this);
  });

  it(
    "Should success with new appName for 'zeta push'",
    async () => {
      // Create the application
      await given()
        /**/ .credentials()
        /*   */ .fromEnv()
        /*   */ .and()
        /**/ .project()
        /*   */ .newProject()
        /*     */ .targetDir('no-appname')
        /*     */ .setAppName('')
        /*     */ .and()
        /*   */ .and()
        /**/ .apply(this);

      // zeta push
      await consoleUserAction('1) zeta push', async () => {
        await zetaPush(this.context.projectDir);
      });

      // Check the .zetarc file
      let zetarc = await readZetarc(this.context.projectDir);
      this.context.zetarc = zetarc;
      expect(zetarc).toBeDefined();
      expect(zetarc.appName).toBeDefined();
      expect(zetarc.appName.length).toBeGreaterThan(0);

      await frontUserAction()
        .name('2) call hello')
        .context(this)
        .execute(async (api) => {
          const message = await api.hello();
          expect(typeof message).toBe('string');
          expect(PATTERN.test(message)).toBe(true);
        });
    },
    15 * 60 * 1000
  );
});
