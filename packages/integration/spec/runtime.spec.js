const { WeakClient } = require('@zetapush/core');
const transports = require('@zetapush/cometd/lib/node/Transports');
const { rm, npmInit, zetaPush, readZetarc, Runner } = require('./utils/commands')
const PATTERN = /Hello World from JavaScript (\d+)/;
const fs = require('fs');


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
   * Broken worker init
   */
  const brokenWorkerDir = 'broken-worker-case';
  it (`Should be able to catch a broken CCS exception`, async () => {
    // await npmInit(this.developerLogin, this.developerPassword, brokenWorkerDir);
    // let zetarc = await readZetarc(brokenWorkerDir);
    // await rm(".generated-projects/"+brokenWorkerDir+"/worker/index.js");
    // fs.copyFileSync('/home/dez/work/celtia/zetapush/packages/integration/spec/templates/broken_ccs_hello.js', "/home/dez/work/celtia/zetapush/packages/integration/.generated-projects/"+brokenWorkerDir+"/worker/index.js");
    
    // const runner = new Runner(brokenWorkerDir);
    // runner.run();
    // await runner.waitForWorkerUp();
    // await runner.stop();
    
    // console.log('done');
    // this.client = new WeakClient({
    //   ...zetarc,
    //   transports
    // })
    // await this.client.connect();
    // const api = this.client.createProxyTaskService();
    // let failure = false;
    // try{
    //   await api.hello();
    // } catch (error){
    //   failure = true;
    // }
    // expect(failure).toBe(true);
  }, 60 * 1000 * 10);  
});