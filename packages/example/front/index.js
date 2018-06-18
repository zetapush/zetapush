const client = new ZetaPush.WeakClient();
const api = client.createProxyTaskService();
client.connect().then(() =>
  [...document.querySelectorAll('button')].forEach((node) =>
    node.removeAttribute('disabled'),
  )
);
const uuid = ((id = 0) => () => ++id)();
const getCurrentTarget = (node, target, selector) => {
  if (matchesSelector.call(target, selector)) { return target; }
  while (target = target.parentNode && node !== target) {
    if (target.nodeType != 1) { return false; }
    if (target.matchesSelector(selector)) { return target; }
  }
  return false;
}
const on = (node, type, selector, handler) => {
  node.addEventListener(type, (event) => {
    var target = getCurrentTarget(node, event.target, selector)
    if (target) {
      handler.call(target, event)
    }
  }, false)
}
const trace = async (element, section) => {
  const id = uuid();
  const { name } = element;
  const section = `${name}--${id}`;
  const behavior = () => api[name]();
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
document.addEventListener('DOMContentLoaded', () => {
  on('[name]', 'click', (event) => trace(event.target));
});
