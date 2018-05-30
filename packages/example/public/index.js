// Create new ZetaPush Client
const client = new ZetaPush.WeakClient();

const api = client.createProxyTaskService();

client.connect().then(() => (
  console.debug('onConnectionEstablished'),
  [...document.querySelectorAll('button')].forEach((node) =>
    node.removeAttribute('disabled'),
  )
));

const uuid = ((id = 0) => () => ++id)();

const on = (cssClass, eventType, handler) =>
  document.querySelector(cssClass).addEventListener(eventType, handler);

const trace = async (section, behavior) => {
  const begin = Date.now();
  let output = null;
  let method = 'log';
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
});
