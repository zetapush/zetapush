const { zetaPush, zetaRun, setAccountToZetarc } = require('../utils/commands');

describe(`As developer with
        - no developerLogin
    `, () => {
  const projectDir = 'empty-app';
  const errorCode = 51;

  beforeEach(async () => {
    this.developerLogin = '';
    this.developerPassword = 'password';

    // Update zetarc with wrong account
    await setAccountToZetarc(
      projectDir,
      this.developerLogin,
      this.developerPassword,
    );
  });

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
