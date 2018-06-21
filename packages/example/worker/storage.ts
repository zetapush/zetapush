import { Injectable, Stack } from '@zetapush/platform';

@Injectable()
export class Storage {
  constructor(private stack: Stack) {}
  push(item: any) {
    return this.stack.push({ stack: 'demo', data: item, owner: null });
  }
  list() {
    return this.stack.list({ stack: 'demo', owner: null, page: null });
  }
}
