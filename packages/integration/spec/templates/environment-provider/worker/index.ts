import { ZetaPushContext, Inject } from '@zetapush/core';
const fs = require('fs');

export default class Api {
  // FIXME: find a way to inject ZetaPushContext without explicit @Inject
  constructor(@Inject(ZetaPushContext) private context: ZetaPushContext) {
    console.log('Api started');
    console.log('----');
    console.log('context', context);
    console.log('----');
    setTimeout(() => console.log('this', this, this.getFrontUrl, this.getWorkerUrl), 0);
    console.log('----');
    console.log('core', fs.readFileSync('./node_modules/@zetapush/core/package.json').toString());
    console.log('----');
    console.log('common', fs.readFileSync('./node_modules/@zetapush/common/package.json').toString());
    console.log('----');
    console.log('cli', fs.readFileSync('./node_modules/@zetapush/cli/package.json').toString());
    console.log('----');
    console.log('client', fs.readFileSync('./node_modules/@zetapush/client/package.json').toString());
    console.log('----');
    console.log('cometd', fs.readFileSync('./node_modules/@zetapush/cometd/package.json').toString());
    console.log('----');
    console.log('worker', fs.readFileSync('./node_modules/@zetapush/worker/package.json').toString());
    console.log('----');
    console.log('code', fs.readFileSync('./node_modules/@zetapush/common/lib/environment/defaults.js').toString());
    console.log('----');
  }

  async getFrontUrl() {
    const url = this.context.getFrontUrl();
    console.log('FRONT URL', url);
    return url;
  }

  async getWorkerUrl() {
    const url = this.context.getWorkerUrl();
    console.log('WORKER URL', url);
    return url;
  }
}
