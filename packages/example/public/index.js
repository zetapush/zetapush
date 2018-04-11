// Create new ZetaPush Client
const client = new ZetaPush.WeakClient({
  apiUrl: 'http://hq.zpush.io:9080/zbo/pub/business',
  sandboxId: '6hO7oA7_',
});
client.helper.servers = Promise.resolve(['http://hq.zpush.io:9082/str']);

class Api extends ZetaPushPlatform.Queue {
  /**
   * Get an Hello World string with server side timestamp value
   * @returns {string}
   */
  hello() { return this.$publish('hello', ''); }
  /**
   * Get the sum of number given list
   * @param {number[]} list
   * @returns {number}
   */
  reduce(list) { return this.$publish('reduce', '', list); }
  /**
   * Add arbitrary item in a stack based storage
   * @returns {Object}
   */
  push(item) { return this.$publish('push', '', { item }); }
  /**
   * List stacked items
   * @returns {Object}
   */
  list() { return this.$publish('list', ''); }
  /**
   * Create a user via Simple Authentication platform service
   * @param {Object} profile
   */
  createUser(profile = {}) { return this.$publish('createUser', '', profile); }
  /**
   * Find users via User Directory platform service
   * @param {Object} parameters
   * @returns {Object}
   */
  findUsers(parameters = {}) { return this.$publish('findUsers', '', parameters); }

  wait({ value, delay = 1000 } ) { return this.$publish('wait', '', { value, delay }); }
}

const api = client.createAsyncTaskService({
  Type: Api,
});

client.onConnectionEstablished(async () => {
  console.debug('onConnectionEstablished');
  [...document.querySelectorAll('button')].forEach((node) =>
    node.removeAttribute('disabled'),
  );
});
client.connect();

const uuid = ((id = 0) => () => ++id)();

const on = (cssClass, eventType, handler) =>
  document.querySelector(cssClass).addEventListener(eventType, handler);

const trace = async (section, behavior) => {
  const begin = Date.now();
  let output = null;
  let method = 'debug';
  try {
    output = await behavior();
  } catch (error) {
    output = error;
    method = 'error';
  }
  const end = Date.now();
  const duration = end - begin;
  console[method]({ section, begin, end, duration, output });
  return output;
};

const parse = (content) => {
  try {
    return JSON.parse(content);
  } catch (error) {
    return content;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  on('.js-Hello', 'click', (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const id = uuid();
    trace(`hello--${id}`, () => api.hello());
  });
  on('.js-Reduce', 'click', async (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const id = uuid();
    trace(`reduce--${id}`, () => api.reduce([10, 20, 30, 40]));
  });
  on('.js-Push', 'click', async (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const id = uuid();
    const item = parse(prompt('Item?'));
    trace(`push--${id}`, () => api.push(item));
  });
  on('.js-List', 'click', async (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const id = uuid();
    const { result: { content: list } } = await trace(`list--${id}`, () => api.list());
    const ul = document.querySelector('ul');
    const fragment = document.createDocumentFragment();
    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
    list.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = JSON.stringify(item);
      fragment.appendChild(li);
    });
    ul.appendChild(fragment);
  });
  on('.js-CreateUser', 'click', async (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const id = uuid();
    trace(`createUser--${id}`, () => api.createUser({
      login: prompt('Login'),
      password: prompt('Password')
    }));
  });
  on('.js-FindUsers', 'click', async (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const id = uuid();
    const { users } = await trace(`findUsers--${id}`, () => api.findUsers({
      query: {
        match_all: {}
      }
    }));
    const list = Object.values(users);
    const ul = document.querySelector('ul');
    const fragment = document.createDocumentFragment();
    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
    list.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = JSON.stringify(item);
      fragment.appendChild(li);
    });
    ul.appendChild(fragment);
  });
  on('.js-Wait', 'click', async (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const id = uuid();
    trace(`wait--${id}`, () => api.wait({
      value: prompt('Value'),
      delay: parseInt(prompt('delay', 1000), 10)
    }));
  });
});
