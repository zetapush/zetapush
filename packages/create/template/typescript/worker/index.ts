import { Injectable, Bootstrappable } from '@zetapush/core';

@Injectable()
export default class Api implements Bootstrappable {
  async onApplicationBootstrap() {
    // Put your bootstrap logic here
  }
  hello() {
    return `Hello World from JavaScript ${Date.now()}`;
  }
}
