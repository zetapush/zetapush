const getAppName = () => {
  const PATTERN = /^#\/sandbox\/(.+)/;
  const [hash, appName] = PATTERN.exec(location.hash) || [];
  if (appName) {
    return appName;
  } else {
    location.href = `#/sandbox/${prompt('sandbox')}`;
    location.reload();
  }
}


// Create new ZetaPush Client
const client = new ZetaPush.WeakClient({
  appName: document.documentElement.dataset.zpSandboxid || getAppName(),
  platformUrl: 'https://celtia-alpha.zpush.io/zbo/pub/business'
});

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
  });});
