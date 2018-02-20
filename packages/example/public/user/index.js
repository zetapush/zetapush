// Create new ZetaPush Client
const client = new ZetaPush.WeakClient({
  apiUrl: 'http://hq.zpush.io:9080/zbo/pub/business',
  sandboxId: 'SgBPjxsL',
});
client.helper.servers = Promise.resolve(['http://hq.zpush.io:9082/str']);

class Api extends ZetaPush.services.Queue {
  createUser({ login, password, fields } = {}) { return this.$publish('createUser', '', { login, password, fields }); }
  getUserList({ userKeys } = {}) { return this.$publish('getUserList', '', { userKeys }); }
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

const uuid = (() => {
  let id = 0;
  return () => ++id;
})();

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

document.addEventListener('DOMContentLoaded', () => {
  on('.js-getUserList', 'click', (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const $id = uuid();
    const userKeys = [...prompt('UserKeys?').split(',')];
    trace(`getUserList--${$id}`, () => api.getUserList({ userKeys }));
  });
  on('.js-createUser', 'click', (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const $id = uuid();
    const login = prompt('Login?');
    const password = prompt('Password?');
    const email = prompt('Password?', `${login}@gmail.com`);
    trace(`createUser--${$id}`, () => api.createUser({ login, password, fields: { email } }));
  });
});
