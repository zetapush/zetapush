// Create new ZetaPush Client
const client = new ZetaPush.WeakClient({
  apiUrl: 'http://hq.zpush.io:9080/zbo/pub/business',
  sandboxId: 'SgBPjxsL',
});
client.helper.servers = Promise.resolve(['http://hq.zpush.io:9082/str']);

class Api extends ZetaPush.services.Queue {
  getMetadata({ id }) { return this.$publish('getMetadata', '', { id }); }
  removeMetadata({ id }) { return this.$publish('removeMetadata', '', { id }); }
  setMetadata({ id, metadata }) { return this.$publish('setMetadata', '', { id, metadata }); }

  getTags({ id }) { return this.$publish('getTags', '', { id }); }
  removeTags({ id }) { return this.$publish('removeTags', '', { id }); }
  setTags({ id, tags }) { return this.$publish('setTags', '', { id, tags }); }

  getTargets({ id }) { return this.$publish('getTargets', '', { id }); }
  removeTargets({ id }) { return this.$publish('removeTargets', '', { id }); }
  setTargets({ id, targets }) { return this.$publish('setTargets', '', { id, targets }); }
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
  on('.js-getMetadata', 'click', (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const $id = uuid();
    const id = prompt('id?', 'id');
    trace(`getMetadata--${$id}`, () => api.getMetadata({ id }));
  });
  on('.js-setMetadata', 'click', async (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const $id = uuid();
    const id = prompt('id?', 'id');
    const metadata = JSON.parse(prompt('id?', '{ "key": "value" }'));
    trace(`setMetadata--${$id}`, () => api.setMetadata({ id, metadata }));
  });
  on('.js-removeMetadata', 'click', async (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    const $id = uuid();
    const id = prompt('id?', 'id');
    trace(`removeMetadata--${$id}`, () => api.removeMetadata({ id }));
  });
});
