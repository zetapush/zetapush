describe('WeakClient', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000

  const apiUrl = 'http://api.zpush.io/'
  const sandboxId = 'bcu1JtRb'

  beforeEach(() => {
    this.client = new ZetaPush.WeakClient({
      apiUrl: apiUrl,
      sandboxId: sandboxId,
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
