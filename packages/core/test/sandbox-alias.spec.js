describe('WeakClient', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;

  const apiUrl = 'http://hq.zpush.io:9080/zbo/pub/business';
  const sandboxId = 'zetapush_v3_ic';

  beforeEach(() => {
    this.client = new ZetaPush.WeakClient({
      apiUrl: apiUrl,
      sandboxId: sandboxId,
    });
  });
  describe('Connection with sandbox alias', () => {
    it('Should connect', (done) => {
      const client = this.client;
      client
        .connect()
        .then(() => expect(client.isConnected()).toBeTruthy())
        .then(() => done());
    });
  });
  describe('Call service created before connection', () => {
    it('Should connect', (done) => {
      const client = this.client;
      const service = client.createService({
        Type: ZetaPushPlatform.Macro,
        listener: {
          welcome(message) {
            expect(message.data.result.message).toBe('Hello, CI!!');
            done();
          },
        },
      });

      client.connect().then(() =>
        service.call({
          name: 'welcome',
          parameters: {
            message: 'CI',
          },
        }),
      );
    });
  });
});
