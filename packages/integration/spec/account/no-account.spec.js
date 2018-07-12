const {
  zetaPush,
  zetaRun,
  setAccountToZetarc,
  npmInstallLatestVersion,
} = require('../utils/commands');
const { given, consoleUserAction } = require('../utils/tdd');

describe(`As developer with
        - account doesn't exists
    `, () => {
  const errorCode = 53;
  const context = {};

  beforeEach(async () => {
    // this.developerLogin = 'accountnotexists@zetapush.com';
    // this.developerPassword = 'password';

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
      /*   */ .login('accountnotexists@zetapush.com')
      /*   */ .password('password')
      /*   */ .and()
      /**/ .testingApp()
      /*   */ .projectName('empty-app')
      /*   */ .latestVersion()
      /*   */ .and()
      /**/ .apply(context);
  }, 30 * 60 * 1000);

  it(
    "Should failed with errorCode 'ACCOUNT-03' (53) for 'zeta push'",
    async () => {
      await consoleUserAction('zeta push', async () => {
        const code = await zetaPush(context.projectDir);
        expect(code).toBe(errorCode);
      });
    },
    20 * 60 * 1000,
  );

  it(
    "Should failed with errorCode 'ACCOUNT-03' (53) for 'zeta run'",
    async () => {
      await consoleUserAction('zeta run', async () => {
        const code = await zetaRun(context.projectDir);
        expect(code).toBe(errorCode);
      });
    },
    15 * 60 * 1000,
  );
});
