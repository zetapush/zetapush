
const { Inject, Stack } = require('@zetapush/platform');

const { Calendar } = require('./calendar');

class PrivateApi {
  static get parameters() {
    return [
      new Inject(Stack)
    ];
  }
  constructor(stack) {
    this.stack = stack;
  }
  async push(item) {
    return this.stack.push({ stack: 'demo', data: item });
  }
  async list() {
    return this.stack.list({ stack: 'demo' });
  }
}

module.exports = class Api {
  static get parameters() {
    return [
      new Inject(PrivateApi),
      new Inject(Calendar)
    ];
  }
  constructor(api, calendar) {
    this.api = api;
    this.calendar = calendar;
  }
  async push(item) {
    return this.api.push({ stack: 'demo', data: item });
  }
  async list() {
    return this.api.list({ stack: 'demo' });
  }
  async hello() {
    return `Hello World toto from JavaScript ${this.calendar.getNow()} Updated`;
  }
  async reduce(list) {
    return list.reduce((cumulator, value) => cumulator + value, 0);
  }
}
