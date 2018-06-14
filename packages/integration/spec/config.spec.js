const { WeakClient } = require('@zetapush/core');
const transports = require('@zetapush/cometd/lib/node/Transports');
const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const PATTERN = /Hello World from JavaScript (\d+)/;

describe('Config Loading', () => {
  it('Should correctly load config', async () => {
    const content = await readFile('./project/.zetarc', { encoding: 'utf-8' });
    expect(typeof content).toBe('string');
  });
});

describe('Config', () => {

  beforeEach(async () => {
    const content = await readFile('./project/.zetarc', { encoding: 'utf-8' });
    this.config = JSON.parse(content);
  });

  describe('Validate config', () => {
    it('Should config to be an JSON Object', async () => {
      expect(this.config).toBeTruthy()
    });

    it('Should config have mandatory properties', async () => {
      expect(this.config.developerLogin).toBeTruthy()
      expect(this.config.developerPassword).toBeTruthy()
    });
  });

});


describe('Connection', () => {

  beforeEach(async () => {
    const content = await readFile('./project/.zetarc', { encoding: 'utf-8' });
    const config = JSON.parse(content);
    this.client = new WeakClient({
      ...config,
      transports
    })
  });

  it('Should client to be correctly created', async () => {
    expect(this.client).toBeTruthy();
  });

  it('Should client can connect and disconnect', async () => {
    expect(this.client.isConnected()).toBe(false);
    await this.client.connect();
    expect(this.client.isConnected()).toBe(true);
  });

  it('Should client can connect and disconnect', async () => {
    await this.client.connect();
    const api = this.client.createProxyTaskService();
    const message = await api.hello();
    expect(typeof message).toBe('string');
    expect(PATTERN.test(message)).toBe(true);
  });
});
