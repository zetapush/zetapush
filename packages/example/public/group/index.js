// Create new ZetaPush Client
const client = new ZetaPush.WeakClient({
  apiUrl: 'http://hq.zpush.io:9080/zbo/pub/business',
  sandboxId: 'iPcadJ_7',
});
client.helper.servers = Promise.resolve(['http://hq.zpush.io:9082/str']);

class Api extends ZetaPush.services.Queue {
  createGroup({ id, name, members, metadata, tags }) { return this.$publish('createGroup', '', { id, name, members, metadata, tags }); }
  deleteGroup({ id }) { return this.$publish('deleteGroup', '', { id }); }
  getGroup({ id }) { return this.$publish('getGroup', '', { id }); }
  getGroupList() { return this.$publish('getGroupList', ''); }
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
  on('.js-createGroup', 'click', async (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const $id = uuid();
    const id = prompt('id?', 'id');
    trace(`createGroup--${$id}`, () => api.createGroup({
      id,
      name: id,
      members: [],
      metadata: {},
      tags: []
    }));
  });
  on('.js-deleteGroup', 'click', (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const $id = uuid();
    const id = prompt('id?', 'id');
    trace(`deleteGroup--${$id}`, () => api.deleteGroup({ id }));
  });
  on('.js-getGroup', 'click', (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const $id = uuid();
    const id = prompt('id?', 'id');
    trace(`getGroup--${$id}`, () => api.getGroup({ id }));
  });
  on('.js-getGroupList', 'click', async (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const $id = uuid();
    const list = await trace(`getGroupList--${$id}`, () => api.getGroupList());
    const ul = document.querySelector('ul');
    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
    ul.appendChild(list.map((group) => {
      const node = document.createElement('li');
      node.textContent = group.name;
      return node;
    }).reduce((fragment, child) => {
      fragment.appendChild(child);
      return fragment;
    }, document.createDocumentFragment()));
  });
});
