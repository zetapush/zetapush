const services = require('./services');

exports.createUser = async (profile = {}) => {
  const api = exports.Factory(services.SimpleAuthentication);
  const output = await api.createUser(profile);
  console.log('createUser', output);
  return output;
}

exports.findUsers = async (parameters = {}) => {
  const api = exports.Factory(services.UserDirectory);
  const output = await api.search(parameters);
  console.log('findUsers', output);
  return output;
}

exports.push = async (data) => {
  const stack = exports.Factory(services.Stack);
  const output = await stack.push({ stack: 'demo', data });
  console.log('push', output);
  return output;
}

exports.list = async () => {
  const stack = exports.Factory(services.Stack);
  const output = await stack.list({ stack: 'demo' });
  console.log('list', output);
  return output;
}

exports.reduce = async (list) =>
  list.reduce((cumulator, value) => cumulator + value, 0);

exports.hello = async () => `Hello World from JavaScript ${Date.now()}`;


