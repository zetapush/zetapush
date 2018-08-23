import { Module } from '@zetapush/core';

import { Calendar } from './calendar';

@Module({
  providers: [ Calendar ]
})
export default class CalendarModule {}

export { Calendar }