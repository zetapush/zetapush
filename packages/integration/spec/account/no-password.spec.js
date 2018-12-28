const { zetaPush, zetaRun } = require('@zetapush/testing');
const { given, consoleAction } = require('@zetapush/testing');

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
      /**/ .project()
      /*   */ .template()
      /*     */ .sourceDir('basic_worker_hello')
      /*     */ .and()
      /*   */ .and()
      /**/ .apply(this);
  }, 10 * 60 * 1000);

  it(
    "Should fail with errorCode 'ACCOUNT-02' (52) for 'zeta push'",
    async () => {
      await consoleAction('zeta push', async () => {
        const { code } = await zetaPush(this.context.projectDir);
        expect(code).toBe(errorCode);
      });
    },
    10 * 60 * 1000
  );

  it(
    "Should fail with errorCode 'ACCOUNT-02' (52) for 'zeta run'",
    async () => {
      await consoleAction('zeta run', async () => {
        const { code } = await zetaRun(this.context.projectDir);
        expect(code).toBe(errorCode);
      });
    },
    10 * 60 * 1000
  );
});
