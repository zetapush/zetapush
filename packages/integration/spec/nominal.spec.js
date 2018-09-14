const { rm, npmInit, zetaPush, readZetarc, nukeProject } = require('@zetapush/testing');
const { consoleAction, frontAction } = require('@zetapush/testing');
const PATTERN = /Hello World from Worker at (\d+)/;

describe(`As developer with
      - valid account
      - no configured application
  `, () => {
  const fullPathProject = `.generated-projects/project-nominal-case`;

  beforeEach(async () => {
    this.developerLogin = process.env.ZETAPUSH_DEVELOPER_LOGIN;
    this.developerPassword = process.env.ZETAPUSH_DEVELOPER_PASSWORD;
    this.platformUrl = process.env.ZETAPUSH_PLATFORM_URL;
    // clean
    await rm(fullPathProject);
  });

  afterEach(async () => {
    try {
      await nukeProject(fullPathProject);
    } catch (e) {
      console.warn('Failed to nuke app for nominal case. Skipping the error', e);
    }
  });

  it(
    `should be able to
      - have a new hello-world project
      - push hello-world
      - use published hello-world custom cloud services`,
    async () => {
      // 1) npm init
      await consoleAction('1) npm init', async () => {
        await npmInit(this.developerLogin, this.developerPassword, fullPathProject, this.platformUrl);
      });

      // 2) zeta push
      await consoleAction('2) zeta push', async () => {
        await zetaPush(fullPathProject);
      });

      let zetarc = await readZetarc(fullPathProject);
      expect(zetarc).toBeTruthy();
      expect(zetarc.appName).toBeDefined();
      expect(zetarc.appName.length).toBeGreaterThan(0);
      expect(zetarc.developerLogin).toBe(this.developerLogin);
      expect(zetarc.developerPassword).toBe(this.developerPassword);

      // 3) check using a client
      await frontAction({ zetarc })
        .name('3) call worker')
        .execute(async (api) => {
          const message = await api.hello();
          expect(typeof message).toBe('string');
          expect(PATTERN.test(message)).toBe(true);
        });
    },
    20 * 60 * 1000
  );
});
