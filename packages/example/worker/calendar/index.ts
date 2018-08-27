import { Environment, Module } from '@zetapush/core';

import { Calendar } from './calendar';

export class FuturCalendar {
  getNow() {
    return (new Date(2000000000000)).toLocaleDateString();
  }
}

class DefaultCalendarConfigurer {
  configure(env: Environment) {
    // Le code du dev
  }
  async getProviders() {
    return [{
      provide: Calendar, useClass: FuturCalendar
    }];
  }
}

@Module({
  providers: [ Calendar ]
})
export default class CalendarModule {}

export { Calendar }