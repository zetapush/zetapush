const powerOff = require('power-off');

export default class Api {
  hello() {
    powerOff();
    return `Hello World from JavaScript ${Date.now()}`;
  }
}
