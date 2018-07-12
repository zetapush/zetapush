const {
  zetaPush,
  readZetarc,
  setAppNameToZetarc,
  rm,
  npmInit,
  nukeApp,
} = require('../utils/commands');
const { WeakClient } = require('@zetapush/client');
const transports = require('@zetapush/cometd/lib/node/Transports');
const PATTERN = /Hello World from JavaScript (\d+)/;
const {
  given,
  consoleUserAction,
  frontUserAction,
  autoclean,
} = require('../utils/tdd');

describe(`As developer with
        - account exists
        - no appName
    `, () => {
  const projectDir = 'project-nominal-case';
  const fullPathProject = `.generated-projects/${projectDir}`;
  const context = {};

  beforeEach(async () => {
    // this.developerLogin = process.env.ZETAPUSH_DEVELOPER_LOGIN;
    // this.developerPassword = process.env.ZETAPUSH_DEVELOPER_PASSWORD;
    // clean
    await rm(fullPathProject);
  });

  afterEach(async () => {
    await autoclean(context);
  });

  it(
    "Should success with new appName for 'zeta push'",
    async () => {
      // Create the application
      given()
        /**/ .credentials()
        /*   */ .fromEnv()
        /*   */ .and()
        /**/ .newApp()
        /*   */ .setAppName('')
        /*   */ .and()
        /**/ .apply(context);
      // await npmInit(this.developerLogin, this.developerPassword, projectDir);
      // // Delete the 'appName' from the .zetarc
      // await setAppNameToZetarc(fullPathProject, '');
      // zeta push
      await consoleUserAction('1) zeta push', async () => {
        await zetaPush(fullPathProject);
      });
      // Check the .zetarc file
      let zetarc = await readZetarc(fullPathProject);
      expect(zetarc.appName.length).toBeGreaterThan(0);
      // check using a client
      // this.client = new WeakClient({
      //   ...zetarc,
      //   transports,
      // });
      // await this.client.connect();
      // const api = this.client.createProxyTaskService();
      await frontUserAction('2) call hello', { zetarc }, async (api) => {
        const message = await api.hello();
        expect(typeof message).toBe('string');
        expect(PATTERN.test(message)).toBe(true);
      });
    },
    15 * 60 * 1000,
  );
});
