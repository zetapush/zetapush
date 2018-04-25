describe('Client', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;

  const apiUrl = 'http://api.zpush.io/';
  const sandboxId = 'bcu1JtRb';

  beforeEach(() => {
    this.client = new ZetaPush.Client({
      apiUrl,
      sandboxId,
      authentication: () => {
        return ZetaPush.Authentication.simple({
          login: 'test',
          password: 'test',
        });
      },
    });
  });

  describe('Initial State', () => {
    it('Should correctly create a Client object', () => {
      expect(typeof this.client).toBe('object');
      expect(this.client instanceof ZetaPush.Client).toBeTruthy();
    });
    it('Should not be connected', () => {
      expect(this.client.isConnected()).toBeFalsy();
    });
    it('Should have a null userId', () => {
      expect(this.client.getUserId()).toBeNull();
    });
    it('Should have a null userInfo', () => {
      expect(this.client.getUserInfo()).toBeNull();
    });
    it('Should have a correct sandboxId', () => {
      expect(this.client.getSandboxId()).toBe(sandboxId);
    });
    it('Should have one or more available servers', () => {
      this.client.getServers().then((servers) => {
        expect(servers.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Connection', () => {
    it('Should be connected', (done) => {
      const client = this.client;
      expect(client.isConnected()).toBeFalsy();
      client
        .connect()
        .then(() => expect(client.isConnected()).toBeTruthy())
        .then(() => done());
    });
    it('Should have a valid userId', (done) => {
      const client = this.client;
      expect(client.getUserId()).toBeNull();
      client
        .connect()
        .then(() => expect(client.getUserId()).toBeTruthy())
        .then(() => done());
    });
    it('Should have a valid userInfo', (done) => {
      const client = this.client;
      expect(client.getUserInfo()).toBeNull();
      client
        .connect()
        .then(() => expect(client.getUserInfo()).not.toBeUndefined())
        .then(() => done());
    });
  });
});
