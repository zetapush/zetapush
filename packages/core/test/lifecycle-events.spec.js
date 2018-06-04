describe('WeakClient', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000

  const platformUrl = 'http://api.zpush.io/'
  const appName = 'bcu1JtRb'

  beforeEach(() => {
    this.client = new ZetaPush.WeakClient({
      platformUrl: platformUrl,
      appName: appName,
      deploymentId: 'weak_1'
    })
  })

  describe('onNegotiationFailed', () => {
    it('Should handle NegocationFailed lifecycle event', (done) => {
      const client = this.client
      client.onNegotiationFailed(() => {
        done()
      })
      client.connect()
    })
  })

})
