const { zetaPush, zetaRun, setAccountToZetarc } = require('../utils/commands');

describe(`As developer with
        - account doesn't exists
    `, () => {
  const projectDir = 'empty-app';
  const errorCode = 53;

  beforeEach(async () => {
    this.developerLogin = 'accountnotexists@zetapush.com';
    this.developerPassword = 'password';

    // Update zetarc with wrong account
    await setAccountToZetarc(
      projectDir,
      this.developerLogin,
      this.developerPassword,
    );
  });

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
