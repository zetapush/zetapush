const {
  zetaPush,
  readZetarc,
  setAppNameToZetarc,
  rm,
  npmInit,
} = require('../utils/commands');
const { WeakClient } = require('@zetapush/core');
const transports = require('@zetapush/cometd/lib/node/Transports');
const PATTERN = /Hello World from JavaScript (\d+)/;

describe(`As developer with
        - account exists
        - no appName
    `, () => {
  const projectDir = 'project-nominal-case';

  beforeEach(async () => {
    this.developerLogin = process.env.ZETAPUSH_DEVELOPER_LOGIN;
    this.developerPassword = process.env.ZETAPUSH_DEVELOPER_PASSWORD;
    // clean
    await rm('.generated-projects/' + projectDir);
  });

  it(
    "Should success with new appName for 'zeta push'",
    async () => {
      // Create the application
      await npmInit(this.developerLogin, this.developerPassword, projectDir);

      // Delete the 'appName' from the .zetarc
      await setAppNameToZetarc(projectDir, '');

      // zeta push
      await zetaPush(projectDir);

      // Check the .zetarc file
      let zetarc = await readZetarc(projectDir);
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
    10 * 60 * 1000,
  );
});
