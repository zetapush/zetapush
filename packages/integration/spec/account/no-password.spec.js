const {
  zetaPush,
  zetaRun,
  setAccountToZetarc,
  npmInstallLatestVersion,
} = require('../utils/commands');

describe(`As developer with
        - no developerPassword
    `, () => {
  // const projectDir = 'testing-projects/empty-app';
  const errorCode = 1;
  const context = {};

  beforeEach(async () => {
    // this.developerLogin = 'user@zetapush.com';
    // this.developerPassword = '';

    // // Install dependencies
    // await npmInstallLatestVersion(projectDir);

    // // Update zetarc with wrong account
    // await setAccountToZetarc(
    //   projectDir,
    //   this.developerLogin,
    //   this.developerPassword,
    // );
    await given()
      /**/ .credentials()
      /*   */ .login('user@zetapush.com')
      /*   */ .password('')
      /*   */ .and()
      /**/ .testingApp()
      /*   */ .projectName('empty-app')
      /*   */ .latestVersion()
      /*   */ .and()
      /**/ .apply(context);
  }, 15 * 60 * 1000);

  it(
    "Should failed with errorCode 'ACCOUNT-02' (52) for 'zeta push'",
    async () => {
      await consoleUserAction('zeta push', async () => {
        const code = await zetaPush(projectDir);
        expect(code).toBe(errorCode);
      });
    },
    15 * 60 * 1000,
  );

  it(
    "Should failed with errorCode 'ACCOUNT-02' (52) for 'zeta run'",
    async () => {
      await consoleUserAction('zeta run', async () => {
        const code = await zetaRun(projectDir);
        expect(code).toBe(errorCode);
      });
    },
    15 * 60 * 1000,
  );
});
