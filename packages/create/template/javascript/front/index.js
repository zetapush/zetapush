const client = new ZetaPushClient.WeakClient();
const api = client.createProxyTaskService();
client.connect().then(() =>
  document.body.classList.add('connected')
);
document.querySelector('.js-Hello').addEventListener('click', async () => {
  console.log(await api.hello());
});
