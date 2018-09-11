import { ZetaPushContext, Inject } from '@zetapush/core';

export default class Api {
  // FIXME: find a way to inject ZetaPushContext without explicit @Inject
  constructor(@Inject(ZetaPushContext) private context: ZetaPushContext) {}

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
