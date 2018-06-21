const {
  zetaPush,
  zetaRun,
  setAccountToZetarc,
  npmInstall,
} = require('../utils/commands');

describe(`As developer with
        - no developerLogin
    `, () => {
  const projectDir = 'testing-projects/empty-app';
  const errorCode = 51;

  beforeEach(async () => {
    this.developerLogin = '';
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
    "Should failed with errorCode 'ACCOUNT-01' (51) for 'zeta push'",
    async () => {
      const code = await zetaPush(projectDir);
      expect(code).toBe(errorCode);
    },
    10 * 60 * 1000,
  );

  it(
    "Should failed with errorCode 'ACCOUNT-01' (51) for 'zeta run'",
    async () => {
      const code = await zetaRun(projectDir);
      expect(code).toBe(errorCode);
    },
    10 * 60 * 1000,
  );
});
