
import { Injectable } from '@zetapush/core';
import { Context } from '@zetapush/platform';

import { Calendar } from './calendar';
import { Storage } from './storage';

@Injectable()
export default class Api {
  constructor(private storage: Storage, private calendar: Calendar) {}
  add(item: any) {
    return this.storage.push(item);
  }
  list() {
    return this.storage.list();
  }
  hello(_: void, context: Context) {
    context.logger.debug('hello');
    return `Hello World from TypeScript ${this.calendar.getNow()}`;
  }
  reduce(list: number[]) {
    return list.reduce((cumulator, value) => cumulator + value, 0);
  }
}
