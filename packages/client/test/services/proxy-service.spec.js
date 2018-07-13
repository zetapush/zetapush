describe('Proxy Service API', () => {

  const platformUrl = 'http://api.zpush.io/'
  const appName = 'bcu1JtRb'

  it('Client should have a createProxyService method', () => {
    expect(typeof ZetaPushClient.Client.prototype.createProxyService).toBe('function')
  })
  it('WeakClient should have a createProxyService method', () => {
    expect(typeof ZetaPushClient.WeakClient.prototype.createProxyService).toBe('function')
  })
  it('SmartClient should have a createProxyService method', () => {
    expect(typeof ZetaPushClient.SmartClient.prototype.createProxyService).toBe('function')
  })
  it('createProxyService method should return an object', () => {
    const client = new ZetaPushClient.WeakClient({
      platformUrl, appName
    })
    const service = client.createProxyService(ZetaPushPlatform.Macro.DEFAULT_DEPLOYMENT_ID)
    expect(typeof service).toBe('object')
  })
  it('createProxyService returned object should support arbitrary properties as defined method', () => {
    const client = new ZetaPushClient.WeakClient({
      platformUrl, appName
    })
    const service = client.createProxyService(ZetaPushPlatform.Macro.DEFAULT_DEPLOYMENT_ID)
    const method = String(Math.random())
    expect(typeof service[method]).toBe('function')
  })
  it('Should correctly respond when call hello macro', (done) => {
    const client = new ZetaPushClient.WeakClient({
      platformUrl, appName
    })
    const service = client.createProxyService(ZetaPushPlatform.Macro.DEFAULT_DEPLOYMENT_ID)
    client.connect()
      .then(() => done())
  })
})
