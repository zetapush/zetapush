const powerOff = require('power-off');


module.exports = class Api {
    hello() {
      powerOff();
      return `Hello World from JavaScript ${Date.now()}`;
    }
}