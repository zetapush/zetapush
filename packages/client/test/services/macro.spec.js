describe('Macro', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000

  const platformUrl = 'http://api.zpush.io/'
  const appName = 'bcu1JtRb'

  beforeEach(() => {
    this.client = new ZetaPushClient.WeakClient({
      platformUrl: platformUrl,
      appName: appName
    })
  })

  it('Should correctly create a service Macro object', () => {
    const service = this.client.createService({
      Type: ZetaPushPlatform.Macro,
      listener: {}
    })
    expect(typeof service).toBe('object')
    expect(typeof service.call).toBe('function')
    expect(service instanceof ZetaPushPlatform.Macro).toBeTruthy()
  })

  it('Should correctly respond when call hello macro', (done) => {
    const name = 'World'
    const client = this.client
    const service = client.createService({
      Type: ZetaPushPlatform.Macro,
      listener: {
        hello: function (message) {
          expect(message.data.result.message).toBe('Hello ' + name + ' !!!')
          done()
        }
      }
    })
    client.connect()
      .then(() => service.call({
        name: 'hello',
        parameters: {
          name: name
        }
      }))
    expect(typeof service).toBe('object')
    expect(typeof service.call).toBe('function')
    expect(service instanceof ZetaPushPlatform.Macro).toBeTruthy()
  })
})
