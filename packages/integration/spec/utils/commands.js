const execa = require('execa');
const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const rimraf = require('rimraf');

const rm = (path) =>
  new Promise((resolve, reject) =>
    rimraf(path, (failure) => (failure ? reject(failure) : resolve())),
  );

const npmInit = (developerLogin, developerPassword, dir) => {
  if (npmVersion().major < 5) {
    throw new Error('Minimum required npm version is 5.6.0');
  }
  let cmd;
  if(process.env.TEST_RELEASE_VERSION) {
    if(npmVersion().major<6) {
      cmd = execa('npx', ['@zetapush/create', dir, '--developer-login', developerLogin, '--developer-password', developerPassword], {cwd: '.generated-projects'});
    } else {
      cmd = execa('npm', ['init', '@zetapush', dir, '--developer-login', developerLogin, '--developer-password', developerPassword], {cwd: '.generated-projects'});
    }
  } else {
    cmd = execa('npx', ['@zetapush/create@canary', dir, '--force-current-version', '--developer-login', developerLogin, '--developer-password', developerPassword], {cwd: '.generated-projects'});
  }
  cmd.stdout.pipe(process.stdout);
  cmd.stderr.pipe(process.stdout);
  return cmd;
};

const zetaPush = (dir) => {
  const cmd = execa('npm', ['run', 'deploy', '--', '-vvv'], {
    cwd: '.generated-projects/' + dir,
  });
  cmd.stdout.pipe(process.stdout);
  cmd.stderr.pipe(process.stdout);
  return cmd;
};

const readZetarc = async (dir) => {
  const content = await readFile(`.generated-projects/${dir}/.zetarc`, {
    encoding: 'utf-8',
  });
  return JSON.parse(content);
};

const npmVersion = () => {
  const { stdout } = execa.sync('npm', ['--version']);
  const [major, minor, patch] = stdout.split('.').map((v) => parseInt(v, 10));
  return { major, minor, patch };
};

module.exports = { rm, npmInit, readZetarc, zetaPush };
