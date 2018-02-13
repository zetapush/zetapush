const { services } = require('@zetapush/core');

Object.assign(exports, services);

exports.SimpleAuthentication = class SimpleAuthentication {
  constructor({ $publish }) { this.$publish = $publish; }
  static get DEFAULT_DEPLOYMENT_ID() { return 'simple_0'; }
  changePassword({ token, key, password } = {}) { return this.$publish('changePassword', { token, key, password }); }
  checkPassword({ key, password } = {}) { return this.$publish('checkPassword', { key, password }); }
  checkUser({ key, softFail } = {}) { return this.$publish('checkUser', { key, softFail }); }
  createUser(profile = {}) { return this.$publish('createUser', profile); }
  credentials({ owner } = {}) { return this.$publish('credentials', { owner }); }
  deleteUser({ key, softFail } = {}) { return this.$publish('deleteUser', { key, softFail }); }
  requestReset({ key } = {}) { return this.$publish('requestReset', { key }); }
  updateKey({ newKey, oldKey, owner } = {}) { return this.$publish('updateKey', { newKey, oldKey, owner }); }
  updateUser(profile = {}) { return this.$publish('updateUser', profile); }
}

exports.UserDirectory = class UserDirectory {
  constructor({ $publish }) { this.$publish = $publish; }
  static get DEFAULT_DEPLOYMENT_ID() { return 'userdir_0'; }
  search({ filter, query, page } = { filter: {}, query: {} }) { return this.$publish('search', { filter, query, page }); }
  userInfo({ userKeys } = {}) { return this.$publish('userInfo', { userKeys }); }
}
