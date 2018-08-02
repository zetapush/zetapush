module.exports = class Api {
  async onApplicationBootstrap() {
    // Put your bootstrap logic here
  }
  hello() {
    return `Hello World from JavaScript ${Date.now()}`;
  }
}
