import { Injectable } from '@zetapush/core';

@Injectable()
export class Calendar {
  getNow() {
    return (new Date()).toLocaleDateString();
  }
}
