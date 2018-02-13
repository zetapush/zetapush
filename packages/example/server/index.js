const services = require('./services');

module.exports = class Api {
  static get injected() {
    return [services.Stack, services.UserDirectory, services.SimpleAuthentication];
  }
  constructor(stack, directory, auth) {
    console.log('Api:constructor', stack, directory, auth)
    this.stack = stack;
    this.directory = directory;
    this.auth = auth;
  }
  async createUser(profile = {}) {
    const output = await this.auth.createUser(profile);
    console.log('createUser', output);
    return output;
  }
  async findUsers(parameters = {}) {
    const output = await this.directory.search(parameters);
    console.log('findUsers', output);
    return output;
  }
  async list() {
    const output = await this.stack.list({ stack: 'demo' });
    console.log('list', output);
    return output;
  }
  async hello() {
    return `Hello World from JavaScript ${Date.now()}`;
  }
  async reduce(list) {
    return list.reduce((cumulator, value) => cumulator + value, 0);
  }
}