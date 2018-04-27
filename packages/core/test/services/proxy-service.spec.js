describe('Proxy Service API', () => {
  const apiUrl = 'http://api.zpush.io/';
  const sandboxId = 'bcu1JtRb';

  it('Client should have a createProxyService method', () => {
    expect(typeof ZetaPush.Client.prototype.createProxyService).toBe(
      'function',
    );
  });
  it('WeakClient should have a createProxyService method', () => {
    expect(typeof ZetaPush.WeakClient.prototype.createProxyService).toBe(
      'function',
    );
  });
  it('SmartClient should have a createProxyService method', () => {
    expect(typeof ZetaPush.SmartClient.prototype.createProxyService).toBe(
      'function',
    );
  });
  it('createProxyService method should return an object', () => {
    const client = new ZetaPush.WeakClient({
      apiUrl,
      sandboxId,
    });
    const service = client.createProxyService(
      ZetaPushPlatform.Macro.DEFAULT_DEPLOYMENT_ID,
    );
    expect(typeof service).toBe('object');
  });
  it('createProxyService returned object should support arbitrary properties as defined method', () => {
    const client = new ZetaPush.WeakClient({
      apiUrl,
      sandboxId,
    });
    const service = client.createProxyService(
      ZetaPushPlatform.Macro.DEFAULT_DEPLOYMENT_ID,
    );
    const method = String(Math.random());
    expect(typeof service[method]).toBe('function');
  });
  it('Should correctly respond when call hello macro', (done) => {
    const client = new ZetaPush.WeakClient({
      apiUrl,
      sandboxId,
    });
    const service = client.createProxyService(
      ZetaPushPlatform.Macro.DEFAULT_DEPLOYMENT_ID,
    );
    client.connect().then(() => done());
  });
});
