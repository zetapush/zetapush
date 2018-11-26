import { Injectable, Context, Module } from '@zetapush/core';
import { Stack } from '@zetapush/platform-legacy';

@Injectable()
export class Dashboard {
  requestContext!: Context;
  constructor(private db: Stack) {}
  hello() {
    this.requestContext.logger.debug('hello');
    return `Hello ${this.requestContext.owner} from Dashboard ${Date.now()}`;
  }
}

@Module({ expose: Dashboard })
export default class DashboardModule {}
