
import { Injectable } from '@zetapush/core';
import { Context } from '@zetapush/platform-legacy';

import { Calendar } from './calendar';
import { Storage } from './storage';
import { LoggerConfig } from './logger';

@Injectable()
export default class Api {
  constructor(
    private storage: Storage,
    private calendar: Calendar,
    config: LoggerConfig
  ) {}
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
