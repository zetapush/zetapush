const { Stack, Userdir, Simple, Macro } = require('@zetapush/platform');

module.exports = class Api {
  /**
   * Explicit injected platform services
   * @returns {Object[]}
   */
  static get injected() {
    return [Stack, Userdir, Simple];
  }
  /**
   * Api constructor, receive injected services
   */
  constructor(stack, directory, auth) {
    console.log('Api:constructor', stack, directory, auth)
    this.stack = stack;
    this.directory = directory;
    this.auth = auth;
  }
  /**
   * Create a user via Simple Authentication platform service
   * @param {Object} profile
   */
  async createUser(profile = {}) {
    const output = await this.auth.createUser(profile);
    console.log('createUser', output);
    return output;
  }
  /**
   * Find users via User Directory platform service
   * @param {Object} parameters
   * @returns {Object}
   */
  async findUsers(parameters = {}) {
    const output = await this.directory.search(parameters);
    console.log('findUsers', output);
    return output;
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
  /**
   * Get an Hello World string with server side timestamp value
   * @returns {string}
   */
  async hello() {
    return `Hello World from JavaScript ${Date.now()}`;
  }
  /**
   * Get the sum of number given list
   * @param {number[]} list
   * @returns {number}
   */
  async reduce(list) {
    return list.reduce((cumulator, value) => cumulator + value, 0);
  }
  wait({ value, delay = 1000 }) {
    return new Promise((resolve, reject) => setTimeout(() => resolve(value), delay));
  }
}
