
const { Inject, Stack } = require('@zetapush/platform');

const { Calendar } = require('./calendar');

module.exports = class Api {
  static get parameters() {
    return [
      new Inject(Stack),
      new Inject(Calendar)
    ];
  }
  constructor(stack, calendar) {
    this.stack = stack;
    this.calendar = calendar;
  }
  /**
   * Add arbitrary item in a stack based storage
   * @returns {Object}
   */
  async push(item) {
    const output = await this.stack.push({ stack: 'demo', data: item });
    console.log('push', output);
    return output;
  }
  /**
   * List stacked items
   * @returns {Object}
   */
  async list() {
    const output = await this.stack.list({ stack: 'demo' });
    console.log('list', output);
    return output;
  }
  async hello() {
    return `Hello World from JavaScript ${this.calendar.getNow()} Updated`;
  }
  async reduce(list) {
    return list.reduce((cumulator, value) => cumulator + value, 0);
  }
}
