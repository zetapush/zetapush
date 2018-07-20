module.exports = class Api {
  hello() {
    process.exit(0);
    return `Hello World from JavaScript ${Date.now()}`;
  }
};
