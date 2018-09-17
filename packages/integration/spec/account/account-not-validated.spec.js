const { zetaPush, zetaRun } = require('@zetapush/testing');
const { given, consoleAction } = require('@zetapush/testing');

describe(`As developer with
        - account not validated
    `, () => {
  const errorCode = 55;

  beforeEach(async () => {
    await given()
      /**/ .credentials()
      /*   */ .login('ci+notvalidated@zetapush.com')
      /*   */ .password('password')
      /*   */ .and()
      /**/ .project()
      /*   */ .template()
      /*     */ .sourceDir('basic_worker_hello')
      /*     */ .and()
      /*   */ .and()
      /**/ .apply(this);
  }, 30 * 60 * 1000);

  it(
    "Should fail with errorCode 'ACCOUNT-05' (55) for 'zeta push'",
    async () => {
      await consoleAction('zeta push', async () => {
        const { code } = await zetaPush(this.context.projectDir);
        expect(code).toBe(errorCode);
      });
    },
    20 * 60 * 1000
  );

  it(
    "Should fail with errorCode 'ACCOUNT-05' (55) for 'zeta run'",
    async () => {
      await consoleAction('zeta run', async () => {
        const { code } = await zetaRun(this.context.projectDir);
        expect(code).toBe(errorCode);
      });
    },
    15 * 60 * 1000
  );
});
