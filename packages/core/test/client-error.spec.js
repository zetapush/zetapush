describe('Client', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000

  const platformUrl = 'http://api.zpush.io/'
  const appName = 'NotAvailableAppName'

  beforeEach(() => {
    this.client = new ZetaPush.Client({
      platformUrl: platformUrl,
      appName: appName,
      authentication: () => {
        return ZetaPush.Authentication.simple({
          login: 'root',
          password: 'root'
        })
      }
    })
  })

  describe('Connection failure', () => {
    it('Should handle connection failure', (done) => {
      const client = this.client
      client.onConnectionToServerFail(() => {
        expect(client.isConnected()).toBeFalsy()
        done()
      })
      client.connect()
    })
  })

  describe('Connection failure', () => {
    it('Should handle no server available', (done) => {
      const client = this.client
      client.onNoServerUrlAvailable(() => {
        expect(client.isConnected()).toBeFalsy()
        done()
      })
      client.connect()
    })
  })
})
