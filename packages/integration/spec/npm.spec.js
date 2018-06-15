const execa = require('execa');

describe('Npm', () => {
  it('Should have a supported npm version', async () => {
    expect(execa).not.toBeNull();
    expect(typeof execa).toBe('function');
    const { stdout } = await execa('npm', ['--version']);
    expect(stdout).not.toBeNull();
    const [major] = stdout.split('.').map((v) => parseInt(v, 10));
    expect(major).toBeGreaterThan(4);
    expect(major).not.toBeGreaterThan(6);
  });
});
