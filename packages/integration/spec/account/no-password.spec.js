const { zetaPush, zetaRun } = require('../utils/commands');
const { given, consoleUserAction } = require('../utils/tdd');

describe(`As developer with
        - no developerPassword
    `, () => {
  const errorCode = 52;

  beforeEach(async () => {
    await given()
      /**/ .credentials()
      /*   */ .login('user@zetapush.com')
      /*   */ .password('')
      /*   */ .and()
      /**/ .testingApp()
      /*   */ .projectName('empty-app')
      /*   */ .latestVersion()
      /*   */ .and()
      /**/ .apply(this);
  }, 15 * 60 * 1000);

  it(
    "Should fail with errorCode 'ACCOUNT-02' (52) for 'zeta push'",
    async () => {
      await consoleUserAction('zeta push', async () => {
        const code = await zetaPush(this.context.projectDir);
        expect(code).toBe(errorCode);
      });
    },
    15 * 60 * 1000,
  );

  it(
    "Should fail with errorCode 'ACCOUNT-02' (52) for 'zeta run'",
    async () => {
      await consoleUserAction('zeta run', async () => {
        const code = await zetaRun(this.context.projectDir);
        expect(code).toBe(errorCode);
      });
    },
    15 * 60 * 1000,
  );
});
