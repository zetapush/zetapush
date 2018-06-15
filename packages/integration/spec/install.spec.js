const execa = require('execa');
const rimraf = require('rimraf');

const rm = (path) => new Promise((resolve, reject) => rimraf(path, (failure) => failure ? reject(failure) : resolve()))

describe('Environement', () => {
  it('Should have a valid environment variables', async () => {
    const {
      ZETAPUSH_DEVELOPER_LOGIN,
      ZETAPUSH_DEVELOPER_PASSWORD
    } = process.env;
    expect(ZETAPUSH_DEVELOPER_LOGIN).not.toBeNull();
    expect(ZETAPUSH_DEVELOPER_PASSWORD).not.toBeNull();
  });
});

describe('Install', () => {

  beforeEach(async () => {
    // TODO clean artifacts
  });

  it('Should have a valid environment variables', async () => {
    const {
      ZETAPUSH_DEVELOPER_LOGIN,
      ZETAPUSH_DEVELOPER_PASSWORD
    } = process.env;
    expect(ZETAPUSH_DEVELOPER_LOGIN).not.toBeNull();
    expect(ZETAPUSH_DEVELOPER_PASSWORD).not.toBeNull();
  })
  it('Should install project correctly', async () => {
    expect(execa).not.toBeNull();
    expect(typeof execa).toBe('function');
  });
});
