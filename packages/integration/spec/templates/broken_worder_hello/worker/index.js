
module.exports = class Api {
    hello() {
      throw new Error("CCS hello error");
      return `Hello World from JavaScript ${Date.now()}`;
    }
  }
  