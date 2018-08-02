// import { Injectable, Gda } from "../../../../../platform"
import { Gda } from '@zetapush/platform-legacy';
import { Injectable } from '@zetapush/core';
import { Provide } from './provide';
@Injectable()
export default class Api {
  constructor(private gda: Gda, private provide: Provide) {}

  async onApplicationBootstrap() {
    await this.gda.put({
      column: 'test',
      data: 'Python is better',
      key: 'test',
      table: 'test'
    });
  }
  async hello() {
    const res = await this.gda.get({
      key: 'test',
      table: 'test'
    });
    return res;
  }
}
