throw new Error('CCS init error');

module.exports = class Api {
  hello() {
    return `Hello World from JavaScript ${Date.now()}`;
  }
};
