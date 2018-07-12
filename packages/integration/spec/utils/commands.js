const stream = require('stream');
const execa = require('execa');
const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const rimraf = require('rimraf');
const { fetch } = require('@zetapush/cli');
const kill = require('tree-kill');

const PLATFORM_URL = 'https://celtia.zetapush.com/zbo/pub/business';

const rm = (path) =>
  new Promise((resolve, reject) =>
    rimraf(path, (failure) => (failure ? reject(failure) : resolve())),
  );

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
  console.log();
  console.log();
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
      console.log(
        'npmInit() -> [npx @zetapush/create --developer-login xxx --developer-password xxx]',
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
      console.log(
        'npmInit() -> [npm init @zetapush --developer-login xxx --developer-password xxx]',
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
    console.log(
      'npmInit() -> [npx @zetapush/create@canary --force-current-version --developer-login xxx --developer-password xxx]',
    );
  }
  cmd.stdout.pipe(/*new IndentStream(*/ process.stdout /*)*/);
  cmd.stderr.pipe(/*new IndentStream(*/ process.stdout /*)*/);

  return cmd;
};

class IndentStream {
  constructor(delegate, indent = '      ') {
    this.delegate = delegate;
    this.indent = indent;
  }

  write(chunk, enc, next) {
    return this.delegate.write(
      chunk.toString().replace(/^/gm, this.indent),
      enc,
      next,
    );
  }
  end(str, encoding, cb) {
    this.delegate.end(str, encoding, cb);
  }
  addListener(event, listener) {
    this.delegate.addListener(event, listener);
    return this;
  }
  on(event, listener) {
    this.delegate.on(event, listener);
    return this;
  }
  once(event, listener) {
    this.delegate.once(event, listener);
    return this;
  }
  removeListener(event, listener) {
    this.delegate.removeListener(event, listener);
    return this;
  }
  off(event, listener) {
    this.delegate.off(event, listener);
    return this;
  }
  removeAllListeners(event) {
    this.delegate.removeAllListeners(event);
    return this;
  }
  setMaxListeners(n) {
    this.delegate.setMaxListeners(n);
    return this;
  }
  getMaxListeners() {
    return this.delegate.getMaxListeners();
  }
  listeners(event) {
    return this.delegate.listeners(event);
  }
  rawListeners(event) {
    return this.delegate.rawListeners(event);
  }
  emit(event) {
    return this.delegate.emit(event);
  }
  listenerCount(type) {
    return this.delegate.listenerCount(type);
  }
  // Added in Node 6...
  prependListener(event, listener) {
    this.delegate.prependListener(event, listener);
    return this;
  }
  prependOnceListener(event, listener) {
    this.delegate.prependOnceListener(event, listener);
    return this;
  }
  eventNames() {
    return this.delegate.eventNames();
  }
}

/**
 * Run 'zeta push' command
 * @param {string} dir Full path of the application folder
 */
const zetaPush = (dir) => {
  try {
    console.log();
    console.log();
    execa.shellSync('npm run deploy -- -vvv', { cwd: dir });
    console.log('zetaPush -> [npm run deploy -- -vvv]');
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
    console.log();
    console.log();
    execa.shellSync('npm run start -- -vvv', { cwd: dir });
    console.log('zetaRun -> [npm run start -- -vvv]');
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
  console.log(`readZetarc(${dir})`);
  const content = await readFile(`${dir}/.zetarc`, {
    encoding: 'utf-8',
  });
  console.log('readZetarc() -> ', content);
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

  if (appName.length > 0) {
    jsonContent.appName = appName;
  } else {
    delete jsonContent.appName;
  }

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
  console.log();
  console.log();
  const { stdout } = execa.sync('npm', ['--version']);
  console.log('npmVersion() -> [npm --version]');
  const [major, minor, patch] = stdout.split('.').map((v) => parseInt(v, 10));
  return { major, minor, patch };
};

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
    console.log();
    console.log();
    execa.shellSync('npm install', { cwd: dir });
    console.log('npmInstall() -> [npm install]');
    return 0;
  } catch (err) {
    console.error(err);
    return err.code;
  }
};

const npmInstallLatestVersion = async (dir) => {
  await rm(`${dir}/node_modules/`);
  await clearDependencies(dir);

  try {
    console.log();
    console.log();
    execa.shellSync('npm install @zetapush/cli@canary --save', { cwd: dir });
    console.log(
      'npmInstallLatestVersion() -> [npm install @zetapush/cli@canary --save]',
    );
    execa.shellSync('npm install @zetapush/platform@canary --save', {
      cwd: dir,
    });
    console.log(
      'npmInstallLatestVersion() -> [npm install @zetapush/platform@canary --save]',
    );
    return 0;
  } catch (err) {
    console.error(err);
    return err.code;
  }
};

/**
 * Remove all installed dependencies
 * @param {string} dir Full path of the application
 */
const clearDependencies = async (dir) => {
  const content = await readFile(`${dir}/package.json`, { encoding: 'utf-8' });

  let jsonContent = JSON.parse(content);
  delete jsonContent.dependencies;

  await writeFile(`${dir}/package.json`, JSON.stringify(jsonContent), {
    encoding: 'utf-8',
  });
};
const createZetarc = (developerLogin, developerPassword, dir) => {
  console.log(`createZetarc(${developerLogin}, ${developerPassword}, ${dir})`);
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
    console.log('Runner:waitForWorkerUp()');
    return new Promise((resolve, err) => {
      const getStatus = async () => {
        console.log('Runner:waitForWorkerUp() -> getStatus()');
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
    console.log();
    console.log();
    this.cmd = execa('npm', ['run', 'start', '--', '-vvv'], { cwd: this.dir });
    console.log('Runner:run() -> [npm run start -- -vvv]');
    if (!quiet) {
      this.cmd.stdout.pipe(/*new IndentStream(*/ process.stdout /*)*/);
      this.cmd.stderr.pipe(/*new IndentStream(*/ process.stdout /*)*/);
    }
    return this.cmd;
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
  npmInstall,
  npmInstallLatestVersion,
  createZetarc,
  nukeApp,
  Runner,
};
