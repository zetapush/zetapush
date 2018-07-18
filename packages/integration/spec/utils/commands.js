const stream = require('stream');
const execa = require('execa');
const util = require('util');
const fs = require('fs');
const path = require('path');
const process = require('process');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const exists = util.promisify(fs.exists);
const rimraf = require('rimraf');
const { fetch } = require('@zetapush/cli');
const kill = require('tree-kill');
const {
  commandLogger,
  SubProcessLoggerStream,
  subProcessLogger,
} = require('./logger');

const PLATFORM_URL = 'https://celtia.zetapush.com/zbo/pub/business';

const rm = (path) =>
  new Promise((resolve, reject) =>
    rimraf(path, (failure) => (failure ? reject(failure) : resolve())),
  );

const getCurrentEnv = (dir) => {
  // get current zetapush version for each module
  const versions = {};
  try {
    const modulesDir = path.join(dir, 'node_modules/@zetapush');
    if (fs.existsSync(modulesDir)) {
      for (let m of fs.readdirSync(modulesDir)) {
        try {
          const packageJson = path.join(modulesDir, m, 'package.json');
          if (fs.existsSync(packageJson)) {
            versions[m] = JSON.parse(
              fs.readFileSync(packageJson).toString(),
            ).version;
          } else {
            versions[m] = 'none';
          }
        } catch (error) {
          versions[m] = { message: 'unredable', error };
        }
      }
    } else {
      versions['*'] = 'none';
    }
  } catch (error) {
    versions['*'] = { message: 'unreadable', error };
  }
  let nodeVer = null;
  try {
    nodeVer = nodeVersion().str;
  } catch (error) {
    nodeVer = 'unknown';
  }
  let npmVer = null;
  try {
    npmVer = npmVersion().str;
  } catch (error) {
    npmVer = 'unknown';
  }
  return { modules: versions, npm: npmVer, node: nodeVer };
};

/**
 * Init a new application
 * @param {string} developerLogin
 * @param {string} developerPassword
 * @param {string} dir Name of the application folder
 */
const npmInit = (developerLogin, developerPassword, dir, platformUrl) => {
  commandLogger.info(
    `npmInit(${developerLogin}, ${developerPassword}, ${dir}, ${platformUrl})`,
  );
  if (npmVersion().major < 5) {
    throw new Error('Minimum required npm version is 5.6.0');
  }
  const relativeDir = path.relative('.generated-projects', dir);
  let cmd;
  if (process.env.TEST_RELEASE_VERSION) {
    if (npmVersion().major < 6) {
      commandLogger.debug(
        `npmInit() -> [npx @zetapush/create ${relativeDir} --developer-login xxx --developer-password xxx ${
          platformUrl ? '--platform-url' + platformUrl : ''
        }]`,
      );
      cmd = execa(
        'npx',
        [
          '@zetapush/create',
          relativeDir,
          '--developer-login',
          developerLogin,
          '--developer-password',
          developerPassword,
          ...(platformUrl ? ['--platform-url', platformUrl] : []),
        ],
        { cwd: '.generated-projects' },
      );
    } else {
      commandLogger.debug(
        `npmInit() -> [npm init @zetapush ${relativeDir} --developer-login xxx --developer-password xxx ${
          platformUrl ? '--platform-url' + platformUrl : ''
        }]`,
      );
      cmd = execa(
        'npm',
        [
          'init',
          '@zetapush',
          relativeDir,
          '--developer-login',
          developerLogin,
          '--developer-password',
          developerPassword,
          ...(platformUrl ? ['--platform-url', platformUrl] : []),
        ],
        { cwd: '.generated-projects' },
      );
    }
  } else {
    commandLogger.debug(
      `npmInit() -> [npx @zetapush/create@canary ${relativeDir} --force-current-version --developer-login xxx --developer-password xxx ${
        platformUrl ? '--platform-url' + platformUrl : ''
      }]`,
    );
    cmd = execa(
      'npx',
      [
        '@zetapush/create@canary',
        relativeDir,
        '--force-current-version',
        '--developer-login',
        developerLogin,
        '--developer-password',
        developerPassword,
        ...(platformUrl ? ['--platform-url', platformUrl] : []),
      ],
      { cwd: '.generated-projects' },
    );
  }
  cmd.stdout.pipe(new SubProcessLoggerStream('silly'));
  cmd.stderr.pipe(new SubProcessLoggerStream('warn'));

  // replace dependencies in node_modules with symlink to local dependencies
  if (useSymlinkedDependencies()) {
    cmd.on('exit', async () => {
      await symlinkLocalDependencies(dir);
    });
  }

  return cmd;
};

/**
 * Run 'zeta push' command
 * @param {string} dir Full path of the application folder
 */
const zetaPush = (dir) => {
  try {
    commandLogger.info(`zetaPush(${dir}) -> [npm run deploy -- -vvv]`);
    const res = execa.shellSync('npm run deploy -- -vvv', { cwd: dir });
    commandLogger.silly(`zetaRun(${dir}) -> [npm run deploy -- -vvv] -> `, {
      exitCode: res.status,
    });
    subProcessLogger.silly('\n' + res.stdout);
    subProcessLogger.warn('\n' + res.stderr);
    return 0;
  } catch (err) {
    subProcessLogger.error('\n' + err.stdout);
    subProcessLogger.error('\n' + err.stderr);
    commandLogger.error(`zetaPush(${dir}) -> [npm run deploy -- -vvv]`, {
      exitCode: err.code,
    });
    return err.code;
  }
};

/**
 * Run 'zeta run' command
 * @param {string} dir Full path of the application folder
 */
const zetaRun = async (dir) => {
  try {
    commandLogger.info(`zetaRun(${dir}) -> [npm run start -- -vvv]`);
    const res = execa.shellSync('npm run start -- -vvv', { cwd: dir });
    commandLogger.silly(`zetaRun(${dir}) -> [npm run start -- -vvv] -> `);
    subProcessLogger.silly('\n' + res.stdout);
    subProcessLogger.warn('\n' + res.stderr);
    return 0;
  } catch (err) {
    subProcessLogger.error('\n' + err.stdout);
    subProcessLogger.error('\n' + err.stderr);
    commandLogger.error(`zetaRun(${dir}) -> [npm run start -- -vvv]`, {
      exitCode: err.code,
    });
    return err.code;
  }
};

/**
 * Read the .zetarc file of an application
 * @param {string} dir Full path of the application folder
 */
const readZetarc = async (dir) => {
  try {
    commandLogger.debug(`readZetarc(${dir})`);
    const content = await readFile(`${dir}/.zetarc`, {
      encoding: 'utf-8',
    });
    commandLogger.debug(`readZetarc(${dir}) -> `, { content });
    return JSON.parse(content);
  } catch (e) {
    commandLogger.error(`readZetarc(${dir}) FAILED`, e);
    throw e;
  }
};

/**
 * Delete login and password of .zetarc file
 * @param {string} dir Full path of the application folder
 */
const deleteAccountFromZetarc = async (dir) => {
  let jsonContent;
  if (await exists(`${dir}/.zetarc`)) {
    const content = await readFile(`${dir}/.zetarc`, { encoding: 'utf-8' });
    jsonContent = JSON.parse(content);

    delete jsonContent.developerLogin;
    delete jsonContent.developerPassword;
  } else {
    jsonContent = {};
  }

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
  let jsonContent;
  if (await exists(`${dir}/.zetarc`)) {
    const content = await readFile(`${dir}/.zetarc`, { encoding: 'utf-8' });
    jsonContent = JSON.parse(content);

    if (appName.length > 0) {
      jsonContent.appName = appName;
    } else {
      delete jsonContent.appName;
    }
  } else {
    jsonContent = { appName };
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
  let jsonContent;
  if (await exists(`${dir}/.zetarc`)) {
    const content = await readFile(`${dir}/.zetarc`, { encoding: 'utf-8' });
    jsonContent = JSON.parse(content);
  } else {
    jsonContent = {};
  }

  if (login && login.length > 0) {
    jsonContent.developerLogin = login;
  } else {
    delete jsonContent.developerLogin;
  }

  if (password && password.length > 0) {
    jsonContent.developerPassword = password;
  } else {
    delete jsonContent.developerPassword;
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
const setPlatformUrlToZetarc = async (dir, platformUrl) => {
  commandLogger.debug(`setPlatformUrlToZetarc(${dir}, ${platformUrl})`);

  let jsonContent;
  if (await exists(`${dir}/.zetarc`)) {
    const content = await readFile(`${dir}/.zetarc`, { encoding: 'utf-8' });
    jsonContent = JSON.parse(content);
  } else {
    jsonContent = {};
  }

  if (platformUrl && platformUrl.length > 0) {
    jsonContent.platformUrl = platformUrl;
  } else {
    delete jsonContent.platformUrl;
  }

  await writeFile(`${dir}/.zetarc`, JSON.stringify(jsonContent), {
    encoding: 'utf-8',
  });

  return jsonContent;
};

const nodeVersion = () => {
  commandLogger.debug('nodeVersion() -> [node --version]');
  const { stdout } = execa.sync('node', ['--version']);
  const [major, minor, patch] = stdout
    .replace('v', '')
    .split('.')
    .map((v) => parseInt(v, 10));
  return { major, minor, patch, str: stdout };
};

const npmVersion = () => {
  commandLogger.debug('npmVersion() -> [npm --version]');
  const { stdout } = execa.sync('npm', ['--version']);
  const [major, minor, patch] = stdout.split('.').map((v) => parseInt(v, 10));
  return { major, minor, patch, str: stdout };
};

/**
 * Update the package.json with latest version and install npm dependencies
 * @param {string} dir Full path of the application folder
 * @param {string} version Version of the ZetaPush dependency
 */
const npmInstall = async (dir, version) => {
  commandLogger.info(`npmInstall(${dir}, ${version})`);

  await rm(`${dir}/node_modules/`);

  const content = await readFile(`${dir}/package.json`, { encoding: 'utf-8' });
  let jsonContent = JSON.parse(content);
  jsonContent.dependencies['@zetapush/cli'] = version;
  jsonContent.dependencies['@zetapush/platform'] = version;

  await writeFile(`${dir}/package.json`, JSON.stringify(jsonContent), {
    encoding: 'utf-8',
  });

  try {
    commandLogger.debug(`npmInstall(${dir}, ${version}) -> [npm install]`);
    const res = execa.shellSync('npm install', { cwd: dir });
    commandLogger.silly(`npmInstall(${dir}, ${version}) -> [npm install] -> `, {
      exitCode: res.status,
    });
    subProcessLogger.silly('\n' + res.stdout);
    subProcessLogger.warn('\n' + res.stderr);

    // replace dependencies in node_modules with symlink to local dependencies
    if (useSymlinkedDependencies()) {
      await symlinkLocalDependencies(dir);
    }
    return 0;
  } catch (err) {
    subProcessLogger.error('\n' + err.stdout);
    subProcessLogger.error('\n' + err.stderr);
    commandLogger.error(`npmInstall(${dir}, ${version})`, err);
    return err.code;
  }
};

const npmInstallLatestVersion = async (dir) => {
  commandLogger.info(`npmInstallLatestVersion(${dir})`);
  await rm(`${dir}/node_modules/`);
  await rm(`${dir}/package-lock.json`);
  await clearDependencies(dir);

  try {
    commandLogger.silly(
      'npmInstallLatestVersion() -> [npm install @zetapush/cli@canary --save]',
    );
    const resCli = execa.shellSync('npm install @zetapush/cli@canary --save', {
      cwd: dir,
    });
    commandLogger.silly(
      'npmInstallLatestVersion() -> [npm install @zetapush/cli@canary --save] -> ',
      { exitCode: resCli.status },
    );
    subProcessLogger.silly('\n' + resCli.stdout);
    subProcessLogger.warn('\n' + resCli.stderr);
    commandLogger.silly(
      'npmInstallLatestVersion() -> [npm install @zetapush/platform@canary --save]',
    );
    const restPf = execa.shellSync(
      'npm install @zetapush/platform@canary --save',
      {
        cwd: dir,
      },
    );
    commandLogger.silly(
      'npmInstallLatestVersion() -> [npm install @zetapush/platform@canary --save] -> ',
      { exitCode: restPf.status },
    );
    subProcessLogger.silly('\n' + restPf.stdout);
    subProcessLogger.warn('\n' + restPf.stderr);

    // replace dependencies in node_modules with symlink to local dependencies
    if (useSymlinkedDependencies()) {
      await symlinkLocalDependencies(dir);
    }
    return 0;
  } catch (err) {
    commandLogger.error('npmInstallLatestVersion()', { exitCode: err.code });
    subProcessLogger.error('\n' + err.stdout);
    subProcessLogger.error('\n' + err.stderr);
    return err.code;
  }
};

const useSymlinkedDependencies = () => {
  return (
    process.env.ZETAPUSH_LOCAL_DEV === 'true' ||
    process.env.ZETAPUSH_LOCAL_DEV === true
  );
};

const symlinkLocalDependencies = async (dir) => {
  try {
    commandLogger.silly(`symlinkLocalDependencies(${dir})`);
    await rm(`${dir}/node_modules/@zetapush/*`);
    fs.symlinkSync(
      path.resolve(__dirname, '../../..', 'cli'),
      `${dir}/node_modules/@zetapush/cli`,
      'dir',
    );
    fs.symlinkSync(
      path.resolve(__dirname, '../../..', 'platform'),
      `${dir}/node_modules/@zetapush/platform`,
      'dir',
    );
    fs.symlinkSync(
      path.resolve(__dirname, '../../..', 'cometd'),
      `${dir}/node_modules/@zetapush/cometd`,
      'dir',
    );
    fs.symlinkSync(
      path.resolve(__dirname, '../../..', 'client'),
      `${dir}/node_modules/@zetapush/client`,
      'dir',
    );
    fs.symlinkSync(
      path.resolve(__dirname, '../../..', 'worker'),
      `${dir}/node_modules/@zetapush/worker`,
      'dir',
    );
  } catch (e) {
    commandLogger.error(`symlinkLocalDependencies(${dir}) FAILED`, e);
    throw e;
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

const createZetarc = (developerLogin, developerPassword, dir, platformUrl) => {
  commandLogger.debug(
    `createZetarc(${developerLogin}, ${developerPassword}, ${dir}, ${platformUrl})`,
  );
  fs.writeFileSync(
    dir + '/.zetarc',
    JSON.stringify(
      {
        platformUrl: platformUrl || PLATFORM_URL,
        developerLogin,
        developerPassword,
      },
      null,
      2,
    ),
  );
};

const nukeApp = (dir) => {
  commandLogger.info(`nukeApp(${dir})`);
  return new Promise(async (resolve, reject) => {
    commandLogger.silly(`nukeApp(${dir}) -> readZetarc(${dir})`);
    const creds = await readZetarc(dir);
    if (creds.appName != undefined) {
      try {
        commandLogger.silly(
          `nukeApp(${dir}) -> DELETE orga/business/nuke/${creds.appName}`,
        );
        const res = await fetch({
          method: 'DELETE',
          config: creds,
          pathname: `orga/business/nuke/${creds.appName}`,
        });
        commandLogger.silly(
          `nukeApp(${dir}) -> DELETE orga/business/nuke/${creds.appName} -> `,
          res,
        );
        resolve(res);
      } catch (err) {
        commandLogger.error(
          `nukeApp(${dir}) -> DELETE orga/business/nuke/${creds.appName}`,
          err,
        );
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
  constructor(dir, timeout = 300000) {
    this.dir = dir;
    this.timeout = timeout;
    this.cmd = null;
  }

  async waitForWorkerUp() {
    commandLogger.debug('Runner:waitForWorkerUp()');
    const start = Date.now();
    return new Promise((resolve, reject) => {
      const getStatus = async () => {
        if (Date.now() - start > this.timeout) {
          commandLogger.error('Runner:waitForWorkerUp() -> timeout');
          reject(
            new Error(`Worker for ${this.dir} not up after ${this.timeout}ms`),
          );
          return;
        }
        commandLogger.silly('Runner:waitForWorkerUp() -> getStatus()');
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
    commandLogger.info('Runner:run() -> [npm run start -- -vvv]');
    this.cmd = execa('npm', ['run', 'start', '--', '-vvv'], { cwd: this.dir });
    if (!quiet) {
      this.cmd.stdout.pipe(new SubProcessLoggerStream('silly'));
      this.cmd.stderr.pipe(new SubProcessLoggerStream('warn'));
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
  getCurrentEnv,
  setPlatformUrlToZetarc,
};
