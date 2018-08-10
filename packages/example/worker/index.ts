import { Injectable, Context, Configure } from '@zetapush/core';

import { Calendar } from './calendar';
import { Storage } from './storage';
import { LoggerConfig } from './logger';
import { ConfigurableApi, ConfigurableApiOptions } from './configurable-api';

@Configure(ConfigurableApi, 'prod')
class MyConfigurableApiOptions extends ConfigurableApiOptions {
  enabled = true;
  typeof = 'MyConfigurableApiOptions2';
  createdAt = 0;
}

@Injectable()
export default class Api {
  constructor(
    private storage: Storage,
    private calendar: Calendar,
    private configurable: ConfigurableApi,
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
  isEnabled() {
    console.log(this.configurable.getTTL());
    return this.configurable.isEnabled();
  }
}
