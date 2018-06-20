const { WeakClient } = require('@zetapush/core');
const transports = require('@zetapush/cometd/lib/node/Transports');
const { rm, npmInit, zetaPush, readZetarc, Runner, createZetarc} = require('./utils/commands')
const PATTERN = /Hello World from JavaScript (\d+)/;
const fs = require('fs');
const copydir = require('copy-dir');

describe(`As developer with 
      - valid account
      - no configured application
  `, () => {
  const projectDir = 'project-nominal-case';

  beforeEach(async () => {
    this.developerLogin = process.env.ZETAPUSH_DEVELOPER_LOGIN
    this.developerPassword = process.env.ZETAPUSH_DEVELOPER_PASSWORD
      // clean
    await rm('.generated-projects/*');
  });

  /**
   * Broken local worker CCS call
   */
  const brokenWorkerDir = 'broken_worker_hello';
  it (`Should be able to catch a broken CCS exception`, async () => {
    console.log(process.cwd())
    copydir.sync('spec/templates/'+brokenWorkerDir, '.generated-projects/'+brokenWorkerDir);
    createZetarc(this.developerLogin, this.developerPassword, '.generated-projects/'+brokenWorkerDir);
    const runner = new Runner(brokenWorkerDir);
    runner.run(quiet = false);
    await runner.waitForWorkerUp();
    const zetarc = await readZetarc(brokenWorkerDir);
    this.client = new WeakClient({
      ...zetarc,
      transports
    })
    await this.client.connect();
    const api = this.client.createProxyTaskService();
    let failure = false;
    try{
      await api.hello();
    } catch (error){
      failure = true;
    } 
    await runner.stop();
    expect(failure).toBe(true);
  }, 60 * 1000 * 10);

  /**
   * Broken local worker init
s   */
  const brokenHelloDir = 'broken_worker_init';
  it (`Should be able to catch a broken worker init exception`, async () => {
    console.log(process.cwd())
    copydir.sync('spec/templates/'+brokenHelloDir, '.generated-projects/'+brokenHelloDir);
    createZetarc(this.developerLogin, this.developerPassword, '.generated-projects/'+brokenHelloDir);
    const runner = new Runner(brokenHelloDir);
    let failure = false;
    try{
      await runner.run(quiet = false);
    }catch (error){
      failure = true;
    }
    await runner.stop();
    expect(failure).toBe(true);
  }, 60 * 1000);  
});