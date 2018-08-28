throw new Error('CCS init error');

export default class Api {
  hello() {
    return `Hello World from JavaScript ${Date.now()}`;
  }
}
