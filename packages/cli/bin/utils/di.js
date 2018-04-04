/**
 * Resolve and inject dependencies
 * @param {ServerClient} client
 * @param {class} Api
 */
const di = (client, Api) => {
  const cache = new WeakMap();
  const factory = (Type) => {
    const service = cache.has(Type)
      ? cache.get(Type)
      : cache
          .set(
            Type,
            client.createAsyncService({
              Type,
            }),
          )
          .get(Type);
    return service;
  };
  const parameters = Api.injected.map((Type) => factory(Type));
  const instance = new Api(...parameters);
  return instance;
};

module.exports = di;
