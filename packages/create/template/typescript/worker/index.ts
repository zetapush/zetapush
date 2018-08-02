import { Injectable, Bootstrapable } from '@zetapush/core';

@Injectable()
export default class Api implements Bootstrapable {
  async onApplicationBootstrap() {
    // Put your bootstrap logic here
  }
  hello() {
    return `Hello World from JavaScript ${Date.now()}`;
  }
}
