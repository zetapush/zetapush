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

describe(`As developer with
        - account exists
        - no appName
    `, () => {
  const projectDir = 'project-nominal-case';
  const fullPathProject = `.generated-projects/${projectDir}`;

  beforeEach(async () => {
    this.developerLogin = process.env.ZETAPUSH_DEVELOPER_LOGIN;
    this.developerPassword = process.env.ZETAPUSH_DEVELOPER_PASSWORD;
    // clean
    await rm(fullPathProject);
  });

  afterEach(async () => {
    await nukeApp(fullPathProject);
  });

  it(
    "Should success with new appName for 'zeta push'",
    async () => {
      // Create the application
      await npmInit(this.developerLogin, this.developerPassword, projectDir);
      // Delete the 'appName' from the .zetarc
      await setAppNameToZetarc(fullPathProject, '');
      // zeta push
      await zetaPush(fullPathProject);
      // Check the .zetarc file
      let zetarc = await readZetarc(fullPathProject);
      expect(zetarc.appName.length).toBeGreaterThan(0);
      // check using a client
      this.client = new WeakClient({
        ...zetarc,
        transports,
      });
      await this.client.connect();
      const api = this.client.createProxyTaskService();
      const message = await api.hello();
      expect(typeof message).toBe('string');
      expect(PATTERN.test(message)).toBe(true);
    },
    15 * 60 * 1000,
  );
});
