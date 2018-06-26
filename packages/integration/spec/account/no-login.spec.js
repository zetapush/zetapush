const {
  zetaPush,
  zetaRun,
  setAccountToZetarc,
  npmInstallLatestVersion,
} = require('../utils/commands');

describe(`As developer with
        - no developerLogin
    `, () => {
  const projectDir = 'testing-projects/empty-app';
  const errorCode = 51;

  beforeEach(async () => {
    this.developerLogin = '';
    this.developerPassword = 'password';

    // Install dependencies
    await npmInstallLatestVersion(projectDir);

    // Update zetarc with wrong account
    await setAccountToZetarc(
      projectDir,
      this.developerLogin,
      this.developerPassword,
    );
  }, 15 * 60 * 1000);

  it(
    "Should failed with errorCode 'ACCOUNT-01' (51) for 'zeta push'",
    async () => {
      const code = await zetaPush(projectDir);
      expect(code).toBe(errorCode);
    },
    15 * 60 * 1000,
  );

  it(
    "Should failed with errorCode 'ACCOUNT-01' (51) for 'zeta run'",
    async () => {
      const code = await zetaRun(projectDir);
      expect(code).toBe(errorCode);
    },
    15 * 60 * 1000,
  );
});
