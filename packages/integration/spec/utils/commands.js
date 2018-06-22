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

const PLATFORM_URL = 'https://celtia.zetapush.com/zbo/pub/business';

/**
 * Init a new application
 * @param {string} developerLogin
 * @param {string} developerPassword
 * @param {string} dir Name of the application folder
 */
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

/**
 * Run 'zeta push' command
 * @param {string} dir Full path of the application folder
 */
const zetaPush = (dir) => {
  try {
    execa.shellSync('npm run deploy -- -vvv', { cwd: dir });
    return 0;
  } catch (err) {
    console.error(err);
    return err.code;
  }
};

/**
 * Run 'zeta run' command
 * @param {string} dir Full path of the application folder
 */
const zetaRun = async (dir) => {
  try {
    execa.shellSync('npm run start -- -vvv', { cwd: dir });
    return 0;
  } catch (err) {
    console.error(err);
    return err.code;
  }
};

/**
 * Read the .zetarc file of an application
 * @param {string} dir Full path of the application folder
 */
const readZetarc = async (dir) => {
  const content = await readFile(`${dir}/.zetarc`, {
    encoding: 'utf-8',
  });
  return JSON.parse(content);
};

/**
 * Delete login and password of .zetarc file
 * @param {string} dir Full path of the application folder
 */
const deleteAccountFromZetarc = async (dir) => {
  const content = await readFile(`${dir}/.zetarc`, { encoding: 'utf-8' });
  let jsonContent = JSON.parse(content);

  delete jsonContent.developerLogin;
  delete jsonContent.developerPassword;

  await writeFile(`${dir}/.zetarc`, JSON.stringify(jsonContent), {
    encoding: 'utf-8',
  });

  return jsonContent;
};

/**
 * Update the appName in the .zetarc
 * @param {string} dir Full path of the application folder
 * @param {string} appName new appName in the .zetarc
 */
const setAppNameToZetarc = async (dir, appName) => {
  const content = await readFile(`${dir}/.zetarc`, { encoding: 'utf-8' });
  let jsonContent = JSON.parse(content);
  jsonContent.appName = appName;

  await writeFile(`${dir}/.zetarc`, JSON.stringify(jsonContent), {
    encoding: 'utf-8',
  });

  return jsonContent;
};

/**
 * Update ZetaPush account in the .zetarc
 * @param {string} dir Full path of the application folder
 * @param {string} login
 * @param {string} password
 */
const setAccountToZetarc = async (dir, login, password) => {
  const content = await readFile(`${dir}/.zetarc`, { encoding: 'utf-8' });
  let jsonContent = JSON.parse(content);

  if (login.length > 0) {
    jsonContent.developerLogin = login;
  } else {
    delete jsonContent.developerLogin;
  }

  if (password.length > 0) {
    jsonContent.developerPassword = password;
  } else {
    delete jsonContent.developerPassword;
  }

  await writeFile(`${dir}/.zetarc`, JSON.stringify(jsonContent), {
    encoding: 'utf-8',
  });

  return jsonContent;
};

const npmVersion = () => {
  const { stdout } = execa.sync('npm', ['--version']);
  const [major, minor, patch] = stdout.split('.').map((v) => parseInt(v, 10));
  return { major, minor, patch };
};

const createZetarc = (developerLogin, developerPassword, dir) => {
  fs.writeFileSync(
    dir + '/.zetarc',
    JSON.stringify(
      {
        platformUrl: PLATFORM_URL,
        developerLogin,
        developerPassword,
      },
      null,
      2,
    ),
  );
};

const nukeApp = (dir) => {
  return new Promise(async (resolve, reject) => {
    const creds = await readZetarc(dir);
    if (creds.appName != undefined) {
      try {
        const res = await fetch({
          method: 'DELETE',
          config: creds,
          pathname: `orga/business/nuke/${creds.appName}`,
        });
        resolve(res);
      } catch (err) {
        resolve(err); //TODO : make reject when orga/business/nuke will send JSON response
      }
    } else {
      reject(new Error('No appName in zetarc'));
    }
  });
};

/**
 * Run a local worker asynchronously with run()
 * wait for it to be up with waitForWorkerUp()
 * stop it with stop()
 *
 *   const runner = new Runner('./myProject');
 *   runner.run();
 *   await runner.waitForWorkerUp();
 *   doStuff();
 *   await runner.stop();
 *
 */
class Runner {
  constructor(dir) {
    this.dir = dir;
    this.cmd = null;
  }

  async waitForWorkerUp() {
    return new Promise((resolve, err) => {
      const getStatus = async () => {
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

  run(quiet = false) {
    this.cmd = execa('npm', ['run', 'start', '--', '-vvv'], {
      cwd: '.generated-projects/' + this.dir,
    });
    if (!quiet) {
      this.cmd.stdout.pipe(process.stdout);
      this.cmd.stderr.pipe(process.stdout);
    }
    return this.cmd;
  }
}

/**
 * Update the package.json with latest version and install npm dependencies
 * @param {string} dir Full path of the application folder
 * @param {string} version Version of the ZetaPush dependency
 */
const npmInstall = async (dir, version) => {
  await rm(`${dir}/node_modules/`);

  const content = await readFile(`${dir}/package.json`, { encoding: 'utf-8' });
  let jsonContent = JSON.parse(content);
  jsonContent.dependencies['@zetapush/cli'] = version;
  jsonContent.dependencies['@zetapush/platform'] = version;

  await writeFile(`${dir}/package.json`, JSON.stringify(jsonContent), {
    encoding: 'utf-8',
  });

  try {
    execa.shellSync('npm install', { cwd: dir });
    return 0;
  } catch (err) {
    console.error(err);
    return err.code;
  }
};

const npmInstallLatestVersion = async (dir) => {
  await rm(`${dir}/node_modules/`);

  try {
    execa.shellSync('npm install @zetapush/cli@canary --save', { cwd: dir });
    execa.shellSync('npm install @zetapush/platform@canary --save', {
      cwd: dir,
    });
    return 0;
  } catch (err) {
    console.error(err);
    return err.code;
  }
};

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
  createZetarc,
  npmInstall,
  nukeApp,
  npmInstallLatestVersion,
};
