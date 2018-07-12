describe('Client', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000

  const appName = 'bcu1JtRb'
  const protocols = ['http']
  const server = '://api.zpush.io/' + appName

  describe('Fetch API Url', () => {
    protocols.forEach((protocol) => {
      it('Should get servers list on ' + protocol + ' sever', (done) => {
        const url = protocol + server
        fetch(url)
          .then((response) => response.json())
          .then((response) => {
            expect(response.servers).toBeTruthy()
            done()
          })
          .catch((error) => {
            expect(error).toBeNull()
            done()
          })
      })
    })
  })
})
