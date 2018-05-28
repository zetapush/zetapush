const getSandboxId = () => {
  const PATTERN = /^#\/sandbox\/(.+)/;
  const [hash, sandboxId] = PATTERN.exec(location.hash) || [];
  if (sandboxId) {
    return sandboxId;
  } else {
    location.href = `#/sandbox/${prompt('sandbox')}`;
    location.reload();
  }
}

const getWeakClientOptions = () => {
  const { zpSandboxid, zpPlatformUrl } =  document.documentElement.dataset;
  return {
    apiUrl: zpPlatformUrl || 'http://hq.zpush.io:9080/zbo/pub/business',
    sandboxId: zpSandboxid || getSandboxId()
  }
}

// Create new ZetaPush Client
const client = new ZetaPush.WeakClient(getWeakClientOptions());

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
