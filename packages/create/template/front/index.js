const client = new ZetaPush.WeakClient();
const api = client.createProxyTaskService();
client.connect().then(() => (
  console.debug('onConnectionEstablished'),
  [...document.querySelectorAll('button')].forEach((node) =>
    node.removeAttribute('disabled'),
  )
));
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.js-Hello').addEventListener('click', async () => {
    console.log(await api.hello());
  });
});
