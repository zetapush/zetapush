const di = (client, Api) => {
  const cache = new WeakMap();
  const factory = (Type) => {
    const service = cache.has(Type) ? cache.get(Type) : cache.set(Type, client.createAsyncService({
      Type
    })).get(Type)
    return service
  };
  const parameters = Api.injected.map((Type) => factory(Type));
  const instance = new Api(...parameters);
  return instance;
}

const client = new ZetaPushServer.ServerClient({
  "apiUrl": "http://hq.zpush.io:9080/zbo/pub/business",
  "sandboxId": "SgBPjxsL",
  "login": "gregory.houllier@zetapush.com",
  "password": "zp.2015"
});

client
  .connect()
  .then(() => {
    console.log('[LOG] Connected');
  })
  .then(() => {
    console.log('[LOG] Register Server Task');
    const declaration = di(client, window.Api)
    client.subscribeTaskServer(declaration);
  })
  .catch((error) => console.error('[ERROR] ZetaPush V3 Error', error));

window.addEventListener('beforeunload', () => {
  console.log('disconnect client properly');
  client.disconnect();
})