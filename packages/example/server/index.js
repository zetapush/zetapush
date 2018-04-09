module.exports = class Api {
  /**
   * Get an Hello World string with server side timestamp value
   * @returns {string}
   */
  async hello() {
    return `Hello World from JavaScript ${Date.now()}`;
  }
  /**
   * Get the sum of number given list
   * @param {number[]} list
   * @returns {number}
   */
  async reduce(list) {
    return list.reduce((cumulator, value) => cumulator + value, 0);
  }

  wait({ value, delay = 1000 }) {
    return new Promise((resolve, reject) => setTimeout(() => resolve(value), delay));
  }
}
