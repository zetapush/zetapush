const services = require('./services');

module.exports = class Api {
  static get injected() {
    return [services.Trigger];
  }
  constructor(triggers) {
    console.log('Api:constructor', stack);
    this.triggers = triggers;
  }
  async createFirstleo(firstleo) {
    const user = await this.createFirstleoUser(firstleo);
    console.log('createFirstleo', user);
    return user;
  }
  async createFirstleoUser(firstleo) {
    /** Check if firstleo already registered (same email, login, username or mobilenumber) */
    await this.checkAlreadyUsedFirstleo({ firstleo });
    /** Create firstleo user */
    const map = await this.firstleoAsMap(firstleo);
    /** Add firstleo role */
    await zpRecipeRole:: addRoleMember({
      name: ROLE_FIRSTLEO,
      member: user.userKey
    });
    /** Trigger event */
    this.triggers.trigger({
      event: EVENT__CREATE_FIRSTLEO_USER,
      data: { userKey: user.userKey, firstleo }
    });
  }
}