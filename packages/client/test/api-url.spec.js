describe('Client', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000

  const appName = 'bcu1JtRb'
  const platformUrl = 'http://zbo.zpush.io/zbo/pub/business/'

  describe('Correct API Url', () => {
    const client = new ZetaPush.Client({
      platformUrl,
      appName,
      authentication: () => {
        return ZetaPush.Authentication.simple({
          login: 'test',
          password: 'test'
        })
      }
    })
    it('Should connect', (done) => {
      expect(client.isConnected()).toBeFalsy()
      client.connect()
        .then(() => expect(client.isConnected()).toBeTruthy())
        .then(() => done())
    })
  })

  describe('Incorrect API Url', () => {
    const client = new ZetaPush.Client({
      platformUrl,
      appName,
      authentication: () => {
        return ZetaPush.Authentication.simple({
          login: 'test',
          password: 'test'
        })
      }
    })
    it('Should connect', (done) => {
      expect(client.isConnected()).toBeFalsy()
      client.connect()
        .then(() => expect(client.isConnected()).toBeTruthy())
        .then(() => done())
    })
  })
})
