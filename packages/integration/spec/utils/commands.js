const execa = require('execa');
const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const rimraf = require('rimraf');
const { fetch } = require('@zetapush/cli');
const kill = require('tree-kill');

const rm = (path) =>
  new Promise((resolve, reject) =>
    rimraf(path, (failure) => (failure ? reject(failure) : resolve())),
  );

const npmInit = (developerLogin, developerPassword, dir) => {
  if (npmVersion().major < 5) {
    throw new Error('Minimum required npm version is 5.6.0');
  }
  let cmd;
  if (process.env.TEST_RELEASE_VERSION) {
    if (npmVersion().major < 6) {
      cmd = execa(
        'npx',
        [
          '@zetapush/create',
          dir,
          '--developer-login',
          developerLogin,
          '--developer-password',
          developerPassword,
        ],
        { cwd: '.generated-projects' },
      );
    } else {
      cmd = execa(
        'npm',
        [
          'init',
          '@zetapush',
          dir,
          '--developer-login',
          developerLogin,
          '--developer-password',
          developerPassword,
        ],
        { cwd: '.generated-projects' },
      );
    }
  } else {
    cmd = execa(
      'npx',
      [
        '@zetapush/create@canary',
        dir,
        '--force-current-version',
        '--developer-login',
        developerLogin,
        '--developer-password',
        developerPassword,
      ],
      { cwd: '.generated-projects' },
    );
  }
  cmd.stdout.pipe(process.stdout);
  cmd.stderr.pipe(process.stdout);
  return cmd;
};

const zetaPush = (dir) => {
  try {
    execa.shellSync('npm run deploy -- -vvv', {
      cwd: '.generated-projects/' + dir,
    });
    return 0;
  } catch (err) {
    console.error(err);
    return err.code;
  }
};

const zetaRun = async (dir) => {
  try {
    execa.shellSync('npm run start -- -vvv', {
      cwd: '.generated-projects/' + dir,
    });
    return 0;
  } catch (err) {
    console.error(err);
    return err.code;
  }
};

const readZetarc = async (dir) => {
  const content = await readFile(`.generated-projects/${dir}/.zetarc`, {
    encoding: 'utf-8',
  });
  return JSON.parse(content);
};

const deleteAccountFromZetarc = async (dir) => {
  const content = await readFile(`.generated-projects/${dir}/.zetarc`, {
    encoding: 'utf-8',
  });
  let jsonContent = JSON.parse(content);

  delete jsonContent.developerLogin;
  delete jsonContent.developerPassword;

  await writeFile(
    `.generated-projects/${dir}/.zetarc`,
    JSON.stringify(jsonContent),
    { encoding: 'utf-8' },
  );

  return jsonContent;
};

const setAppNameToZetarc = async (dir, appName) => {
  const content = await readFile(`.generated-projects/${dir}/.zetarc`, {
    encoding: 'utf-8',
  });
  let jsonContent = JSON.parse(content);
  jsonContent.appName = appName;

  await writeFile(
    `.generated-projects/${dir}/.zetarc`,
    JSON.stringify(jsonContent),
    { encoding: 'utf-8' },
  );

  return jsonContent;
};

const setAccountToZetarc = async (dir, login, password) => {
  const content = await readFile(`.generated-projects/${dir}/.zetarc`, {
    encoding: 'utf-8',
  });
  let jsonContent = JSON.parse(content);
  jsonContent.developerLogin = login;
  jsonContent.developerPassword = password;

  await writeFile(
    `.generated-projects/${dir}/.zetarc`,
    JSON.stringify(jsonContent),
    { encoding: 'utf-8' },
  );

  return jsonContent;
};

const npmVersion = () => {
  const { stdout } = execa.sync('npm', ['--version']);
  const [major, minor, patch] = stdout.split('.').map((v) => parseInt(v, 10));
  return { major, minor, patch };
};

/**
 * Run a local worker asynchronously with run()
 * wait for it to be up with waitForWorkerUp()
 * stop it with stop()
 *
 *   const runner = new Runner('./myProject');
 *   runner.run();
 *   await runner.waitForWorkerUp();
 *   await runner.stop();
 *
 */
class Runner {
  constructor(dir) {
    this.dir = dir;
    this.cmd = null;
  }

  async waitForWorkerUp() {
    return new Promise((resolve) => {
      const getStatus = async () => {
        // console.log("is up ? ")
        const creds = await readZetarc(this.dir);
        if (creds.appName != undefined) {
          const res = await fetch({
            config: creds,
            pathname: `orga/business/live/${creds.appName}`,
          });
          for (let node in res.nodes) {
            for (let item in res.nodes[node].items) {
              if (res.nodes[node].items[item].itemId === 'queue') {
                if (res.nodes[node].items[item].liveData != undefined) {
                  if (
                    res.nodes[node].items[item].liveData['queue.workers']
                      .length > 0
                  ) {
                    // console.log("it's up !");
                    resolve();
                    return;
                  }
                }
              }
            }
          }
        }
        setTimeout(getStatus, 300);
      };
      getStatus();
    });
  }

  stop() {
    return new Promise((resolve) => {
      kill(this.cmd.pid, 'SIGTERM', () => {
        resolve();
      });
    });
  }

  run() {
    console.log('RUN');
    this.cmd = execa('npm', ['run', 'start', '--', '-vvv'], {
      cwd: '.generated-projects/' + this.dir,
    });
    this.cmd.stdout.pipe(process.stdout);
    this.cmd.stderr.pipe(process.stdout);
  }
}

module.exports = {
  rm,
  npmInit,
  readZetarc,
  zetaPush,
  deleteAccountFromZetarc,
  zetaRun,
  setAppNameToZetarc,
  setAccountToZetarc,
  Runner,
};
