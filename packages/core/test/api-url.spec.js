describe('Client', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000

  const sandboxId = 'bcu1JtRb'
  const apiUrl = 'http://zbo.zpush.io/zbo/pub/business/'

  describe('Correct API Url', () => {
    const client = new ZetaPush.Client({
      apiUrl,
      sandboxId,
      authentication: () => {
        return ZetaPush.Authentication.simple({
          login: 'test',
          password: 'test'
        })
      }
    })
    it('Should connect', (done) => {
      client.onConnectionEstablished(() => {
        expect(client.isConnected()).toBeTruthy()
        done()
      })
      expect(client.isConnected()).toBeFalsy()
      client.connect()
    })
  })

  describe('Incorrect API Url', () => {
    const client = new ZetaPush.Client({
      apiUrl,
      sandboxId,
      authentication: () => {
        return ZetaPush.Authentication.simple({
          login: 'test',
          password: 'test'
        })
      }
    })
    it('Should connect', (done) => {
      client.onConnectionEstablished(() => {
        expect(client.isConnected()).toBeTruthy()
        done()
      })
      expect(client.isConnected()).toBeFalsy()
      client.connect()
    })
  })
})
