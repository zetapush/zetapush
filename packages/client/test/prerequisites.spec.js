describe('Prerequisites', () => {
  it('Should have Promise global function', () => {
    expect(typeof Promise).toBe('function')
  })
  it('Should have fetch global function', () => {
    expect(typeof fetch).toBe('function')
  })
})
