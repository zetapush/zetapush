describe('Macro', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000

  const apiUrl = 'http://api.zpush.io/'
  const sandboxId = 'bcu1JtRb'

  beforeEach(() => {
    this.client = new ZetaPush.WeakClient({
      apiUrl: apiUrl,
      sandboxId: sandboxId
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
