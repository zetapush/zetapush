import { Injectable, Context, Module } from '@zetapush/core';
import { Stack } from '@zetapush/platform-legacy';

@Injectable()
export class Api {
  requestContext!: Context;
  constructor(private db: Stack) {}
  hello() {
    this.requestContext.logger.debug('hello');
    return `Hello ${this.requestContext.owner} from Api ${Date.now()}`;
  }
}

@Module({ expose: Api })
export default class ApiModule {}
