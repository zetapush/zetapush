describe('Public API', () => {
  it('Should define a ZetaPush global object', () => {
    expect(typeof ZetaPush).toBe('object')
  })
  it('Should define a ZetaPush.Client class', () => {
    expect(typeof ZetaPush.Client).toBe('function')
  })
  it('Should define a ZetaPush.SmartClient class', () => {
    expect(typeof ZetaPush.SmartClient).toBe('function')
  })
  it('Should define a ZetaPush.WeakClient class', () => {
    expect(typeof ZetaPush.WeakClient).toBe('function')
  })
  it('Should define a ZetaPush.services object', () => {
    expect(typeof ZetaPush.services).toBe('object')
  })
  it('Should define a ZetaPush.Authentication class', () => {
    expect(typeof ZetaPush.Authentication).toBe('function')
  })
})
