const { Inject, Stack } = require('@zetapush/platform');

class Storage {
  static get parameters() {
    return [
      new Inject(Stack)
    ];
  }
  constructor(stack) {
    this.stack = stack;
  }
  push(item) {
    return this.stack.push({ stack: 'demo', data: item });
  }
  list() {
    return this.stack.list({ stack: 'demo' });
  }
}

module.exports = { Storage };
