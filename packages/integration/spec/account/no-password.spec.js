const { zetaPush, zetaRun, setAccountToZetarc } = require('../utils/commands');

describe(`As developer with
        - no developerPassword
    `, () => {
  const projectDir = 'empty-projects/empty-app';
  const errorCode = 52;

  beforeEach(async () => {
    this.developerLogin = 'user@zetapush.com';
    this.developerPassword = '';

    // Update zetarc with wrong account
    await setAccountToZetarc(
      projectDir,
      this.developerLogin,
      this.developerPassword,
    );
  });

  it(
    "Should failed with errorCode 'ACCOUNT-02' (52) for 'zeta push'",
    async () => {
      const code = await zetaPush(projectDir);
      expect(code).toBe(errorCode);
    },
    10 * 60 * 1000,
  );

  it(
    "Should failed with errorCode 'ACCOUNT-02' (52) for 'zeta run'",
    async () => {
      const code = await zetaRun(projectDir);
      expect(code).toBe(errorCode);
    },
    10 * 60 * 1000,
  );
});
