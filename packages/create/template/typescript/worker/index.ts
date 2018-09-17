import { Injectable } from '@zetapush/core';

@Injectable()
export default class {
  hello() {
    return `Hello World from Worker at ${Date.now()}`;
  }
}
