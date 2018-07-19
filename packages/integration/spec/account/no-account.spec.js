const { zetaPush, zetaRun } = require('@zetapush/testing');
const { given, consoleUserAction } = require('@zetapush/testing');

describe(`As developer with
        - account doesn't exists
    `, () => {
  const errorCode = 53;

  beforeEach(async () => {
    await given()
      /**/ .credentials()
      /*   */ .login('accountnotexists@zetapush.com')
      /*   */ .password('password')
      /*   */ .and()
      /**/ .testingApp()
      /*   */ .projectName('empty-app')
      /*   */ .latestVersion()
      /*   */ .and()
      /**/ .apply(this);
  }, 30 * 60 * 1000);

  it(
    "Should fail with errorCode 'ACCOUNT-03' (53) for 'zeta push'",
    async () => {
      await consoleUserAction('zeta push', async () => {
        const { code } = await zetaPush(this.context.projectDir);
        expect(code).toBe(errorCode);
      });
    },
    20 * 60 * 1000,
  );

  it(
    "Should fail with errorCode 'ACCOUNT-03' (53) for 'zeta run'",
    async () => {
      await consoleUserAction('zeta run', async () => {
        const { code } = await zetaRun(this.context.projectDir);
        expect(code).toBe(errorCode);
      });
    },
    15 * 60 * 1000,
  );
});
