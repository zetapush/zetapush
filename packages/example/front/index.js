const client = new ZetaPushClient.WeakClient();
const api = client.createProxyTaskService();
client.connect().then(() =>
  document.body.classList.add('connected')
);
document.querySelector('.js-Hello').addEventListener('click', async () => {
  console.log(await api.hello());
});
document.querySelector('.js-Add').addEventListener('click', async () => {
  console.log(await api.add({
    name: prompt('Name?', JSON.stringify({ key: 'value' }))
  }));
});
document.querySelector('.js-List').addEventListener('click', async () => {
  console.log(await api.list());
});