// Create new ZetaPush Client
const client = new ZetaPush.WeakClient({
  apiUrl: 'http://hq.zpush.io:9080/zbo/pub/business',
  sandboxId: 'iPcadJ_7',
});
client.helper.servers = Promise.resolve(['http://hq.zpush.io:9082/str']);

class Api extends ZetaPush.services.Queue {
  confirmFileUpload({ guid, owner, actions, metadata, tags }) { return this.$publish('confirmFileUpload', '', { guid, owner, actions, metadata, tags }); }
  requestFileUpload({ contentType, folder, owner }) { return this.$publish('requestFileUpload', '', { contentType, folder, owner }); }
  getFileEntryList({ folder, owner }) { return this.$publish('getFileEntryList', '', { folder, owner }); }
  deleteFileEntry({ path, owner }) { return this.$publish('deleteFileEntry', '', { path, owner }); }
}

const api = client.createAsyncTaskService({
  Type: Api,
});

client.onConnectionEstablished(async () => {
  console.debug('onConnectionEstablished');
  [...document.querySelectorAll('button,label')].forEach((node) =>
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

const doUpload = (request) => new Promise((resolve, reject) => {
  const { file, guid, httpMethod, owner, url } = request;
  const xhr = new XMLHttpRequest();
  xhr.addEventListener(
    'readystatechange',
    (e) => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(request);
        } else {
          reject(request);
        }
      }
    },
    false,
  );
  xhr.upload.addEventListener(
    'progress',
    (e) => {
      const done = e.position || e.loaded;
      const total = e.totalSize || e.total;
      const progression = Math.floor(done / total * 1000) / 10;
      console.log(`xhr.upload progress: ${done} / ${total} = ${progression}%`);
    },
    false,
  );
  xhr.open(httpMethod, url, true);
  xhr.setRequestHeader('Content-Type', request.contentType);
  xhr.send(file);
});

const getFileEntryList = async () => {
  const $id = uuid();
  const { entries } = await trace(`getFileEntryList--${$id}`, () => api.getFileEntryList({
    folder: '/'
  }));
  const main = document.querySelector('main');
  while (main.firstChild) {
    main.removeChild(main.firstChild);
  }
  main.appendChild(entries.map((entry) => {
    const node = document.createElement('img');
    node.src = entry.file.url;
    node.addEventListener('click', async (event) => {
      main.removeChild(node);
      await trace(`deleteFileEntry--${$id}`, () => api.deleteFileEntry({
        path: entry.file.path
      }));
    })
    return node;
  }).reduce((fragment, child) => {
    fragment.appendChild(child);
    return fragment;
  }, document.createDocumentFragment()));
  console.log(entries);
}

document.addEventListener('DOMContentLoaded', () => {
  on('.js-getFileEntryList', 'click', async (event) => {
    event.target.dataset.count =
      (parseInt(event.target.dataset.count, 10) || 0) + 1;
    await getFileEntryList();
  });
  on('.js-selectFile', 'change', async (event) => {
    const files = Array.from(event.target.files);
    console.log('.js-selectFile', 'change', files);
    const $id = uuid();
    const promises = files.map((file) => trace(`requestFileUpload--${$id}`, () => api.requestFileUpload({
        contentType: file.type,
        folder: '/'
      })).then((request) => doUpload({
        file,
        ...request
      })).then((request) => trace(`confirmFileUpload--${$id}`, () => api.confirmFileUpload({
        guid: request.guid,
        actions: [],
        metadata: {},
        tags: []
      })))
    );
    Promise.all(promises).then((requests) => getFileEntryList());
  });
});
