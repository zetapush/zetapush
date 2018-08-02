describe('Public API', () => {
  it('Should define a ZetaPushClient global object', () => {
    expect(typeof ZetaPushClient).toBe('object')
  })
  it('Should define a ZetaPushClient.Client class', () => {
    expect(typeof ZetaPushClient.Client).toBe('function')
  })
  it('Should define a ZetaPushClient.SmartClient class', () => {
    expect(typeof ZetaPushClient.SmartClient).toBe('function')
  })
  it('Should define a ZetaPushClient.WeakClient class', () => {
    expect(typeof ZetaPushClient.WeakClient).toBe('function')
  })
  it('Should define a ZetaPushPlatformLegacy object', () => {
    expect(typeof ZetaPushPlatformLegacy).toBe('object')
  })
  it('Should define a ZetaPushClient.Authentication class', () => {
    expect(typeof ZetaPushClient.Authentication).toBe('function')
  })
})
