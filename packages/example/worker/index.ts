import { Injectable, Context, Module, Environment } from '@zetapush/core';

import CalendarModule, { Calendar } from './calendar';
import { Storage } from './storage';
import { LoggerConfig } from './logger';

@Injectable()
export class Api {
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

class ApiConfigurer {
  configure(env: Environment) {
    // Le code du dev
  }
  async getProviders() {
    return [{
      provide: Calendar, useClass: PastCalendar
    }];
  }
}

export class PastCalendar {
  getNow() {
    return (new Date(0)).toLocaleDateString();
  }
}


@Module({
  imports: [ CalendarModule ],
  providers: [  ],
  configurers: [ /*ApiConfigurer*/ ],
  expose: Api
})
export default class ApiModule {}
