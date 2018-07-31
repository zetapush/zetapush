// const { WeakClient } = require('@zetapush/client');
// const transports = require('@zetapush/cometd/lib/node/Transports');
const { rm, npmInit, zetaPush, readZetarc } = require('@zetapush/testing');
const PATTERN = /Hello World from JavaScript (\d+)/;

describe(`As developer with
      - valid account
      - no configured application
      - network latency
  `, () => {
  // const projectDir = 'project-nominal-case';
  // const fullPathProject = `.generated-projects/${projectDir}`;

  beforeEach(async () => {
    // this.developerLogin = process.env.ZETAPUSH_DEVELOPER_LOGIN;
    // this.developerPassword = process.env.ZETAPUSH_DEVELOPER_PASSWORD;
    // // clean
    // await rm(fullPathProject);
  });

  xit(
    `should be able to
      - have a new hello-world project
      - push hello-world
      - use published hello-world custom cloud services`,
    async () => {
      // // 1) npm init
      // await npmInit(this.developerLogin, this.developerPassword, projectDir);
      // // 2) zeta push
      // await zetaPush(fullPathProject);
      // let zetarc = await readZetarc(fullPathProject);
      // expect(zetarc).toBeTruthy();
      // expect(zetarc.appName).toBeTruthy();
      // expect(zetarc.developerLogin).toBe(this.developerLogin);
      // expect(zetarc.developerPassword).toBe(this.developerPassword);
      // // 3) check using a client
      // this.client = new WeakClient({
      //   ...zetarc,
      //   transports,
      // });
      // await this.client.connect();
      // const api = this.client.createProxyTaskService();
      // const message = await api.hello();
      // expect(typeof message).toBe('string');
      // expect(PATTERN.test(message)).toBe(true);
      // expect(true).toBe(true);
      // await nukeApp(fullPathProject);
    },
    10 * 60 * 1000
  );
});
