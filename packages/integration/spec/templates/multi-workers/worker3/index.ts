import { Module } from '@zetapush/core';

class MyTestApi {
  hello3() {
    return `Hello World from worker 3 with namespace`;
  }
}

@Module({
  expose: {
    worker3: MyTestApi
  }
})
export default class Api {}
