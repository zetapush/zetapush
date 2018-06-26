import { Injectable, Stack } from '@zetapush/platform';

@Injectable()
export class Storage {
  constructor(private stack: Stack) {}
  push(item: any) {
    return this.stack.push({ stack: 'demo', data: item });
  }
  list() {
    return this.stack.list({ stack: 'demo' });
  }
}
