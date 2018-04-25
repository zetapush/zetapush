describe('AsyncMacro', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;

  class HelloMacro extends ZetaPushPlatform.Macro {
    hello(parameters) {
      return this.$publish('hello', parameters);
    }
  }

  const apiUrl = 'http://api.zpush.io/';
  const sandboxId = 'bcu1JtRb';

  beforeEach(() => {
    this.client = new ZetaPush.WeakClient({
      apiUrl: apiUrl,
      sandboxId: sandboxId,
    });
    this.service = this.client.createAsyncMacroService({
      Type: HelloMacro,
    });
  });

  it('Should correctly create a service Macro object', () => {
    const service = this.service;
    expect(typeof service).toBe('object');
    expect(typeof service.call).toBe('function');
    expect(service instanceof HelloMacro).toBeTruthy();
  });

  it('Should correctly respond when call hello macro', (done) => {
    const name = 'World';
    const client = this.client;
    const service = this.service;

    expect(typeof service).toBe('object');
    expect(typeof service.call).toBe('function');
    expect(service instanceof ZetaPushPlatform.Macro).toBeTruthy();

    client
      .connect()
      .then(() =>
        service.hello({
          name: name,
        }),
      )
      .then((result) => expect(result.message).toBe('Hello ' + name + ' !!!'))
      .then(() => done());
  });
});
