import { Injectable, Context, Module } from '@zetapush/core';

import { Calendar } from './calendar';
import { Storage } from './storage';
import { LoggerConfig } from './logger';

@Injectable()
export class Api {
  requestContext!: Context;
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
  hello() {
    this.requestContext.logger.debug('hello');
    return `Hello ${this.requestContext.owner} from TypeScript ${this.calendar.getNow()}`;
  }
  reduce(list: number[]) {
    return list.reduce((cumulator, value) => cumulator + value, 0);
  }
}

@Module({ expose: Api })
export default class ApiModule {}
