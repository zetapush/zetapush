const {
  zetaPush,
  zetaRun,
  setAccountToZetarc,
  npmInstall,
} = require('../utils/commands');

describe(`As developer with
        - account doesn't exists
    `, () => {
  const projectDir = 'testing-projects/empty-app';
  const errorCode = 53;

  beforeEach(async () => {
    this.developerLogin = 'accountnotexists@zetapush.com';
    this.developerPassword = 'password';
    this.version = process.env.ZETAPUSH_VERSION;

    // Install dependencies
    await npmInstall(projectDir, this.version);

    // Update zetarc with wrong account
    await setAccountToZetarc(
      projectDir,
      this.developerLogin,
      this.developerPassword,
    );
  }, 10 * 60 * 1000);

  it(
    "Should failed with errorCode 'ACCOUNT-03' (53) for 'zeta push'",
    async () => {
      const code = zetaPush(projectDir);
      expect(code).toBe(errorCode);
    },
    10 * 60 * 1000,
  );

  it(
    "Should failed with errorCode 'ACCOUNT-03' (53) for 'zeta run'",
    async () => {
      const code = await zetaRun(projectDir);
      expect(code).toBe(errorCode);
    },
    10 * 60 * 1000,
  );
});
