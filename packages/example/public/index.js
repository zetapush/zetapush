// Create new ZetaPush Client
const client = new ZetaPush.WeakClient({
  apiUrl: 'http://hq.zpush.io:9080/zbo/pub/business',
  sandboxId: 'vMPONvQj',
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
   * Wait before api response
   * @param {{ value: any, delay: number}} parameters
   * @returns {number}
   */
  wait({ value, delay = 1000 } ) { return this.$publish('wait', '', { value, delay }); }
}

const api = client.createAsyncTaskService({
  Type: Api,
});

client.connect().then(() => [...document.querySelectorAll('button')].forEach((node) =>
  node.removeAttribute('disabled'),
));

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
