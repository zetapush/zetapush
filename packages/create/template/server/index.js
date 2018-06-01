
const { Inject } = require('@zetapush/platform');

const { Calendar } = require('./calendar.js');
const { Storage } = require('./storage.js')

module.exports = class Api {
  static get parameters() {
    return [
      new Inject(Storage),
      new Inject(Calendar)
    ];
  }
  constructor(storage, calendar) {
    this.storage = storage;
    this.calendar = calendar;
  }
  push(item) {
    return this.storage.push(item);
  }
  list() {
    return this.storage.list();
  }
  hello() {
    return `Hello World from JavaScript ${this.calendar.getNow()} Updated`;
  }
  reduce(list) {
    return list.reduce((cumulator, value) => cumulator + value, 0);
  }
}
