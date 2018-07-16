const { zetaPush, readZetarc } = require('../utils/commands');
const PATTERN = /Hello World from JavaScript (\d+)/;
const { given, consoleUserAction, frontUserAction, autoclean } = require('../utils/tdd');

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
        /**/ .newApp()
        /*   */ .dir('no-appname')
        /*   */ .setAppName('')
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

      await frontUserAction('2) call hello', { zetarc }, async (api) => {
        const message = await api.hello();
        expect(typeof message).toBe('string');
        expect(PATTERN.test(message)).toBe(true);
      });
    },
    15 * 60 * 1000
  );
});
