const { WeakClient } = require('@zetapush/core');
const transports = require('@zetapush/cometd/lib/node/Transports');
const { rm, npmInit, zetaPush, readZetarc } = require('./utils/commands')
const PATTERN = /Hello World from JavaScript (\d+)/;

describe(`As developer with 
      - valid account
      - no configured application
  `, () => {
  const projectDir = 'project-nominal-case'

  beforeEach(async () => {
    this.developerLogin = process.env.ZETAPUSH_DEVELOPER_LOGIN
    this.developerPassword = process.env.ZETAPUSH_DEVELOPER_PASSWORD
      // clean
    await rm('.generated-projects/'+projectDir)
  });

  it(`should be able to 
      - have a new hello-world project
      - push hello-world
      - use published hello-world custom cloud services`, async () => {
    // 1) npm init
    await npmInit(this.developerLogin, this.developerPassword, projectDir)
    const zetarc = await readZetarc(projectDir)
    expect(zetarc).toBeTruthy()
    expect(zetarc.developerLogin).toBe(this.developerLogin)
    expect(zetarc.developerPassword).toBe(this.developerPassword)
    
    // 2) zeta push
    await zetaPush(projectDir)

    // 3) check using a client
    this.client = new WeakClient({
      ...zetarc,
      transports
    })
    await this.client.connect();
    const api = this.client.createProxyTaskService();
    const message = await api.hello();
    expect(typeof message).toBe('string');
    expect(PATTERN.test(message)).toBe(true);
  }, 10*60*1000);
});