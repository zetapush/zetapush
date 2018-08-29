import { Module } from '@zetapush/core';
import { ExpressServerConfigurer } from '.';

export * from './adapter';
export * from './server';

@Module({
  configurers: [ExpressServerConfigurer],
  providers: []
})
export class HttpServerModule {}
