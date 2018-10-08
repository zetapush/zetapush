const client = new ZetaPushClient.WeakClient();
const api = client.createProxyTaskService();
client.connect().then(() => document.body.classList.add('connected'));
document.querySelector('.js-FrontUrl').addEventListener('click', async () => {
  document.querySelector('.output').innerHTML += await api.getFrontUrl();
});
document.querySelector('.js-WorkerUrl').addEventListener('click', async () => {
  document.querySelector('.output').innerHTML += await api.getWorkerUrl();
});
