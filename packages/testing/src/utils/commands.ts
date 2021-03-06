const execa = require('execa');
import { ExecaChildProcess } from 'execa';
import * as fs from 'fs';
import { PathLike, readFileSync, writeFileSync, existsSync } from 'fs';
import * as path from 'path';
import * as process from 'process';
const rimraf = require('rimraf');
import { fetch, ResolvedConfig, decrypt, getLiveStatus } from '@zetapush/common';
const kill = require('tree-kill');
import { commandLogger, SubProcessLoggerStream, subProcessLogger } from './logger';
import { PassThrough } from 'stream';
import { FrontOptions } from './types';
import { debugObject } from '@zetapush/common';
import { getZetaFilePath } from '@zetapush/common';
import { Socket } from 'dgram';
const ipc = require('node-ipc');

const PLATFORM_URL = 'https://zbo.zpush.io/zbo/pub/business';

export const rm = (path: PathLike) =>
  new Promise((resolve, reject) => rimraf(path.toString(), (failure: any) => (failure ? reject(failure) : resolve())));

export const getCurrentEnv = (dir: PathLike) => {
  // get current zetapush version for each module
  const versions: any = {};
  try {
    const modulesDir = path.join(dir.toString(), 'node_modules/@zetapush');
    if (fs.existsSync(modulesDir)) {
      for (let m of fs.readdirSync(modulesDir)) {
        try {
          const packageJson = path.join(modulesDir, m, 'package.json');
          if (fs.existsSync(packageJson)) {
            versions[m] = JSON.parse(fs.readFileSync(packageJson).toString()).version;
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
export const npmInit = (
  developerLogin: string,
  developerPassword: string,
  dir: PathLike,
  platformUrl?: string,
  localNpmRegistry = 'https://registry.npmjs.org'
) => {
  commandLogger.info(`npmInit(${developerLogin}, ${developerPassword}, ${dir}, ${platformUrl})`);
  if (npmVersion().major < 5) {
    throw new Error('Minimum required npm version is 5.6.0');
  }
  const relativeDir = path.relative('.generated-projects', dir.toString());
  let cmd;
  if (process.env.TEST_RELEASE_VERSION) {
    if (npmVersion().major < 6) {
      commandLogger.debug(
        `npmInit() -> [npx @zetapush/create ${relativeDir} --developer-login xxx --developer-password xxx ${
          platformUrl ? '--platform-url ' + platformUrl : ''
        }]`
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
          ...(platformUrl ? ['--platform-url', platformUrl] : [])
        ],
        { cwd: '.generated-projects' }
      );
    } else {
      commandLogger.debug(
        `npmInit() -> [npm init @zetapush ${relativeDir} --developer-login xxx --developer-password xxx ${
          platformUrl ? '--platform-url ' + platformUrl : ''
        }]`
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
          ...(platformUrl ? ['--platform-url', platformUrl] : [])
        ],
        { cwd: '.generated-projects' }
      );
    }
  } else if (useSymlinkedDependencies()) {
    const createPath = getZetapushModuleDirectoryPath('create', 'index.js');
    commandLogger.debug(
      `npmInit() -> [node ${createPath} ${relativeDir} --force-current-version --developer-login xxx --developer-password xxx ${
        platformUrl ? '--platform-url ' + platformUrl : ''
      }]`
    );
    cmd = execa(
      'node',
      [
        createPath,
        relativeDir,
        '--developer-login',
        developerLogin,
        '--developer-password',
        developerPassword,
        ...(platformUrl ? ['--platform-url', platformUrl] : []),
        '--force-current-version' // force current version for `zeta push`
      ],
      { cwd: '.generated-projects' }
    );
  } else {
    commandLogger.debug(
      `npmInit() -> [npx @zetapush/create@canary ${relativeDir} --force-current-version --developer-login xxx --developer-password xxx ${
        platformUrl ? '--platform-url ' + platformUrl : ''
      }]`
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
        ...(platformUrl ? ['--platform-url', platformUrl] : [])
      ],
      { cwd: '.generated-projects' }
    );
  }
  cmd.stdout.pipe(new SubProcessLoggerStream('silly'));
  cmd.stderr.pipe(new SubProcessLoggerStream('warn'));
  cmd.on('exit', (code: number, signal: any) => {
    subProcessLogger.silly(`npmInit() -> exited`, { code, signal });
  });

  // add node-ipc dependency to listen to started event
  cmd.on('exit', async () => {
    await addDependency('node-ipc@9.1.1');
  });

  // replace dependencies in node_modules with symlink to local dependencies
  if (useSymlinkedDependencies()) {
    cmd.on('exit', async () => {
      await symlinkLocalDependencies(dir);
    });
  }

  return cmd;
};

const addDependency = async (dependency: string) => {
  const cmd = execa('npm', ['install', dependency], { cwd: '.generated-projects' });
  cmd.stdout.pipe(new SubProcessLoggerStream('silly'));
  cmd.stderr.pipe(new SubProcessLoggerStream('warn'));
  cmd.on('exit', (code: number, signal: any) => {
    subProcessLogger.silly(`npmInit() -> exited`, { code, signal });
  });
  return cmd;
};

const getZetapushModuleDirectoryPath = (module: string, file?: string) => {
  // __dirname = <zetapush>/packages/integration/node_modules/@zetapush/testing/lib/utils/
  // target module path = <zetapush>/packages/<module>
  if (path.dirname(path.join(__dirname, '../../../../..')).endsWith('packages')) {
    return path.join(__dirname, '../../../../../..', module, file || '');
  }
  // __dirname = <zetapush>/packages/testing/lib/utils/
  // target module path = <zetapush>/packages/<module>
  if (path.dirname(path.join(__dirname, '../..')).endsWith('packages')) {
    return path.join(__dirname, '../../..', module, file || '');
  }
  // cwd = <zetapush>/packages/integration
  // target module path = <zetapush>/packages/<module>
  if (fs.existsSync(path.join(process.cwd(), 'packages'))) {
    return path.join(process.cwd(), 'packages', module, file || '');
  }
  throw new Error("Can't determine where ZetaPush sources are");
};

/**
 * Run 'zeta push' command
 * @param {string} dir Full path of the application folder
 * @param {string} localNpmRegistry Full url for a npm registry url
 */
export const zetaPush = (dir: PathLike, localNpmRegistry = 'https://registry.npmjs.org') => {
  return new Promise((resolve, reject) => {
    commandLogger.info(`zetaPush(${dir}) -> [npm run deploy -- ${zpLogLevel()} --registry ${localNpmRegistry}]`);
    const stdout: Array<string | Buffer> = [];
    const stderr: Array<string | Buffer> = [];

    const cmd = execa.shell(`npm run deploy -- ${zpLogLevel()} --registry ${localNpmRegistry}`, {
      cwd: dir.toString()
    });
    const out = new PassThrough();
    const err = new PassThrough();
    out.on('data', (chunk) => stdout.push(chunk));
    err.on('data', (chunk) => stderr.push(chunk));
    cmd.stdout.pipe(out).pipe(new SubProcessLoggerStream('silly'));
    cmd.stderr.pipe(err).pipe(new SubProcessLoggerStream('warn'));
    cmd.on('exit', (code: number, signal: any) => {
      const res = {
        cmd,
        code,
        signal,
        stdout: stdout.join('\n'),
        stderr: stderr.join('\n')
      };
      subProcessLogger.silly(
        `zetaPush(${dir}) -> [npm run deploy -- ${zpLogLevel()}] --registry ${localNpmRegistry} -> `,
        {
          code,
          signal
        }
      );
      resolve(res);
    });
  });
};

/**
 * Run 'zeta run' command
 * @param {string} dir Full path of the application folder
 */
export const zetaRun = async (dir: PathLike) => {
  return new Promise((resolve, reject) => {
    commandLogger.info(`zetaRun(${dir}) -> [npm run start -- ${zpLogLevel()}]`);
    const stdout: Array<string | Buffer> = [];
    const stderr: Array<string | Buffer> = [];
    const cmd = execa.shell(`npm run start -- ${zpLogLevel()}`, {
      cwd: dir.toString()
    });
    const out = new PassThrough();
    const err = new PassThrough();
    out.on('data', (chunk) => stdout.push(chunk));
    err.on('data', (chunk) => stderr.push(chunk));
    cmd.stdout.pipe(out).pipe(new SubProcessLoggerStream('silly'));
    cmd.stderr.pipe(err).pipe(new SubProcessLoggerStream('warn'));
    cmd.on('exit', (code: number, signal: any) => {
      const res = {
        cmd,
        code,
        signal,
        stdout: stdout.join('\n'),
        stderr: stderr.join('\n')
      };
      subProcessLogger.silly(`zetaRun(${dir}) -> [npm run start -- ${zpLogLevel()}] -> `, {
        code,
        signal
      });
      resolve(res);
    });
  });
};

/**
 * Read the .zetarc file of an application
 * @param {string} dir Full path of the application folder
 */
export const readZetarc = async (dir: PathLike): Promise<ResolvedConfig> => {
  try {
    commandLogger.debug(`readZetarc(${dir})`);
    const content = readFileSync(`${dir}/.zetarc`, {
      encoding: 'utf-8'
    });
    const parsed = decrypt(JSON.parse(content)) as ResolvedConfig;
    commandLogger.debug(`readZetarc(${dir}) -> `, { content, parsed });
    return parsed;
  } catch (e) {
    commandLogger.error(`readZetarc(${dir}) FAILED`, e);
    throw e;
  }
};

/**
 * Delete login and password of .zetarc file
 * @param {string} dir Full path of the application folder
 */
export const deleteAccountFromZetarc = async (dir: PathLike) => {
  let jsonContent;
  if (existsSync(`${dir}/.zetarc`)) {
    const content = readFileSync(`${dir}/.zetarc`, { encoding: 'utf-8' });
    jsonContent = JSON.parse(content);

    delete jsonContent.developerLogin;
    delete jsonContent.developerPassword;
    delete jsonContent.developerSecretToken;
  } else {
    jsonContent = {};
  }

  writeFileSync(`${dir}/.zetarc`, JSON.stringify(jsonContent), {
    encoding: 'utf-8'
  });

  return jsonContent;
};

/**
 * Update the appName in the .zetarc
 * @param {string} dir Full path of the application folder
 * @param {string} appName new appName in the .zetarc
 */
export const setAppNameToZetarc = async (dir: PathLike, appName: string) => {
  let jsonContent;
  if (existsSync(`${dir}/.zetarc`)) {
    const content = readFileSync(`${dir}/.zetarc`, { encoding: 'utf-8' });
    jsonContent = JSON.parse(content);

    if (appName.length > 0) {
      jsonContent.appName = appName;
    } else {
      delete jsonContent.appName;
    }
  } else {
    jsonContent = { appName };
  }

  writeFileSync(`${dir}/.zetarc`, JSON.stringify(jsonContent), {
    encoding: 'utf-8'
  });

  return jsonContent;
};

/**
 * Update ZetaPush account in the .zetarc
 * @param {string} dir Full path of the application folder
 * @param {string} login
 * @param {string} password
 */
export const setAccountToZetarc = async (dir: PathLike, login: string, password: string) => {
  let jsonContent;
  if (existsSync(`${dir}/.zetarc`)) {
    const content = readFileSync(`${dir}/.zetarc`, { encoding: 'utf-8' });
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
  delete jsonContent.developerSecretToken;

  writeFileSync(`${dir}/.zetarc`, JSON.stringify(jsonContent), {
    encoding: 'utf-8'
  });

  return jsonContent;
};

/**
 * Update ZetaPush account in the .zetarc
 * @param {string} dir Full path of the application folder
 * @param {string} login
 * @param {string} password
 */
export const setPlatformUrlToZetarc = async (dir: PathLike, platformUrl?: string) => {
  commandLogger.debug(`setPlatformUrlToZetarc(${dir}, ${platformUrl})`);

  let jsonContent;
  if (existsSync(`${dir}/.zetarc`)) {
    const content = readFileSync(`${dir}/.zetarc`, { encoding: 'utf-8' });
    jsonContent = JSON.parse(content);
  } else {
    jsonContent = {};
  }

  if (platformUrl && platformUrl.length > 0) {
    jsonContent.platformUrl = platformUrl;
  } else {
    delete jsonContent.platformUrl;
  }

  writeFileSync(`${dir}/.zetarc`, JSON.stringify(jsonContent), {
    encoding: 'utf-8'
  });

  return jsonContent;
};

export const nodeVersion = () => {
  commandLogger.debug('nodeVersion() -> [node --version]');
  const { stdout } = execa.sync('node', ['--version']);
  const [major, minor, patch] = stdout
    .replace('v', '')
    .split('.')
    .map((v: string) => parseInt(v, 10));
  return { major, minor, patch, str: stdout };
};

export const npmVersion = () => {
  commandLogger.debug('npmVersion() -> [npm --version]');
  const { stdout } = execa.sync('npm', ['--version']);
  const [major, minor, patch] = stdout.split('.').map((v: string) => parseInt(v, 10));
  return { major, minor, patch, str: stdout };
};

/**
 * Update the package.json with latest version and install npm dependencies
 * @param {string} dir Full path of the application folder
 * @param {string} version Version of the ZetaPush dependency
 */
export const npmInstall = async (dir: PathLike, version: string, localNpmRegistry = 'https://registry.npmjs.org') => {
  commandLogger.info(`npmInstall(${dir}, ${version})`);

  await rm(`${dir}/node_modules/`);

  const content = readFileSync(`${dir}/package.json`, { encoding: 'utf-8' });
  let jsonContent = JSON.parse(content);

  // FIXME: why changing versions of all dependencies ???
  Object.keys(jsonContent.dependencies).map(function(data) {
    jsonContent.dependencies[data] = version;
  });

  // add node-ipc dependency to listen to started event
  jsonContent.dependencies['node-ipc'] = '9.1.1';

  writeFileSync(`${dir}/package.json`, JSON.stringify(jsonContent), {
    encoding: 'utf-8'
  });

  try {
    commandLogger.debug(`npmInstall(${dir}, ${version}) -> [npm install --registry ${localNpmRegistry}]`);
    debugObject('npm-install-execute', { dir });

    await runShellCommand(`npm install --registry ${localNpmRegistry}`, { cwd: dir.toString() });
    debugObject('npm-install-executed', { dir });

    // replace dependencies in node_modules with symlink to local dependencies
    if (useSymlinkedDependencies()) {
      await symlinkLocalDependencies(dir);
    }

    return 0;
  } catch (err) {
    debugObject('npm-install-err', { err });

    subProcessLogger.error('\n' + err.stdout);
    subProcessLogger.error('\n' + err.stderr);
    commandLogger.error(`npmInstall(${dir}, ${version})`, err);

    return err.code;
  }
};

const runShellCommand = (command: string, options: any, validExitCodes = [0]) => {
  return new Promise((resolve, reject) => {
    const file = getZetaFilePath('zeta-debug', `${Date.now()}-shellcommand.log`);
    const stdout: Array<string | Buffer> = [];
    const stderr: Array<string | Buffer> = [];
    const cmd = execa.shell(command, options);
    const out = new PassThrough();
    const err = new PassThrough();
    out.on('data', (chunk) => {
      try {
        fs.appendFileSync(file, chunk.toString());
      } catch (e) {}
      stdout.push(chunk);
    });
    err.on('data', (chunk) => {
      try {
        fs.appendFileSync(file, chunk.toString());
      } catch (e) {}
      stderr.push(chunk);
    });
    cmd.stdout.pipe(out).pipe(new SubProcessLoggerStream('silly'));
    cmd.stderr.pipe(err).pipe(new SubProcessLoggerStream('warn'));
    const exited = (code: number, signal: any) => {
      const res = {
        cmd,
        code,
        signal,
        stdout: stdout.join('\n'),
        stderr: stderr.join('\n')
      };
      subProcessLogger.silly(`${command} -> exited`, {
        code,
        signal
      });
      if (validExitCodes.includes(code)) {
        resolve(res);
      } else {
        reject(res);
      }
    };
    cmd.once('exit', exited);
    cmd.once('close', exited);
  });
};

export const npmInstallLatestVersion = async (dir: PathLike, localNpmRegistry = 'https://registry.npmjs.org') => {
  commandLogger.info(`npmInstallLatestVersion(${dir})`);
  await rm(`${dir}/node_modules/`);
  await rm(`${dir}/package-lock.json`);
  await clearDependencies(dir);

  try {
    commandLogger.silly('npmInstallLatestVersion() -> [npm install @zetapush/cli@canary --save]');
    const resCli = execa.shellSync('npm install @zetapush/cli@canary --save', {
      cwd: dir.toString()
    });
    commandLogger.silly('npmInstallLatestVersion() -> [npm install @zetapush/cli@canary --save] -> ', {
      exitCode: resCli.code
    });
    subProcessLogger.silly('\n' + resCli.stdout);
    subProcessLogger.warn('\n' + resCli.stderr);
    commandLogger.silly('npmInstallLatestVersion() -> [npm install @zetapush/platform-legacy@canary --save]');
    const restPf = execa.shellSync('npm install @zetapush/platform-legacy@canary --save', {
      cwd: dir.toString()
    });
    commandLogger.silly('npmInstallLatestVersion() -> [npm install @zetapush/platform-legacy@canary --save] -> ', {
      exitCode: restPf.code
    });
    subProcessLogger.silly('\n' + restPf.stdout);
    subProcessLogger.warn('\n' + restPf.stderr);

    // add node-ipc dependency to listen to started event
    await addDependency('node-ipc@9.1.1');

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

export const useSymlinkedDependencies = () => {
  return <any>process.env.ZETAPUSH_LOCAL_DEV === 'true' || <any>process.env.ZETAPUSH_LOCAL_DEV === true;
};

export const symlinkLocalDependencies = async (dir: PathLike) => {
  try {
    commandLogger.silly(`symlinkLocalDependencies(${dir})`);
    for (let moduleName of fs.readdirSync(path.join(dir.toString(), 'node_modules', '@zetapush'))) {
      await rm(`${dir}/node_modules/@zetapush/${moduleName}`);
      fs.symlinkSync(getZetapushModuleDirectoryPath(moduleName), `${dir}/node_modules/@zetapush/${moduleName}`, 'dir');
      commandLogger.silly(
        `symlink ${getZetapushModuleDirectoryPath(moduleName)} -> ${dir}/node_modules/@zetapush/${moduleName}`
      );
    }
    commandLogger.silly(`symlinkLocalDependencies(${dir}) DONE`);
  } catch (e) {
    commandLogger.error(`symlinkLocalDependencies(${dir}) FAILED`, e);
    throw e;
  }
};

/**
 * Remove all installed dependencies
 * @param {string} dir Full path of the application
 */
export const clearDependencies = async (dir: PathLike) => {
  const content = readFileSync(`${dir}/package.json`, { encoding: 'utf-8' });

  let jsonContent = JSON.parse(content);
  delete jsonContent.dependencies;

  writeFileSync(`${dir}/package.json`, JSON.stringify(jsonContent), {
    encoding: 'utf-8'
  });
};

export const createZetarc = (
  developerLogin: string,
  developerPassword: string,
  dir: PathLike,
  platformUrl?: string
) => {
  commandLogger.debug(`createZetarc(${developerLogin}, ${developerPassword}, ${dir}, ${platformUrl})`);
  fs.writeFileSync(
    dir + '/.zetarc',
    JSON.stringify(
      {
        platformUrl: platformUrl || PLATFORM_URL,
        developerLogin,
        developerPassword
      },
      null,
      2
    )
  );
};

export const nukeProject = async (dir: PathLike) => {
  commandLogger.info(`nukeProject(${dir})`);
  try {
    commandLogger.silly(`nukeProject(${dir}) -> readZetarc(${dir})`);
    const creds = await readZetarc(dir);
    await nukeApp(creds);
  } catch (e) {
    commandLogger.warn(`nukeProject(${dir}) -> readZetarc(${dir}) FAILED`, e);
    throw e;
  }
};

export const nukeApp = (zetarc: ResolvedConfig) => {
  commandLogger.info(`nukeApp(${zetarc})`);
  return new Promise(async (resolve, reject) => {
    if (zetarc && zetarc.appName) {
      try {
        commandLogger.silly(`nukeApp(${zetarc}) -> DELETE orga/business/nuke/${zetarc.appName}`);
        const res = await fetch({
          method: 'DELETE',
          config: zetarc,
          pathname: `orga/business/nuke/${zetarc.appName}`,
          debugName: 'nukeApp'
        });
        commandLogger.silly(`nukeApp(${zetarc}) -> DELETE orga/business/nuke/${zetarc.appName} -> `, res);
        resolve(res);
      } catch (err) {
        commandLogger.error(`nukeApp(${zetarc}) -> DELETE orga/business/nuke/${zetarc.appName}`, err);
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
export class Runner {
  private cmd?: ExecaChildProcess;
  private runExitCode = 0;
  private localWorkerStarted = false;
  private ipcId: string;

  constructor(
    private dir: string,
    private timeout = 300000,
    private localNpmRegistry: string = 'https://registry.npmjs.org',
    private frontOptions?: FrontOptions
  ) {
    this.ipcId = `zetapush-testing-${Date.now()}`;
  }

  async waitForWorkerUp() {
    commandLogger.debug('Runner:waitForWorkerUp()');
    const start = Date.now();
    return new Promise((resolve, reject) => {
      const getStatus = async () => {
        if (this.runExitCode > 0) {
          commandLogger.silly('Runner:waitForWorkerUp() -> run() FAILED with code', this.runExitCode);
          return reject(
            new Error(
              `runner.run() has exited with code ${
                this.runExitCode
              }. The worker won't start correctly so waiting to be up has been stopped`
            )
          );
        }
        if (Date.now() - start > this.timeout) {
          commandLogger.error('Runner:waitForWorkerUp() -> timeout');
          reject(new Error(`Worker for ${this.dir} not up after ${this.timeout}ms`));
          return;
        }
        commandLogger.silly('Runner:waitForWorkerUp() -> getStatus()');
        try {
          const creds = await readZetarc(this.dir);
          if (creds.appName != undefined) {
            commandLogger.silly('Runner:waitForWorkerUp() -> getLiveStatus()');
            const res = await fetch({
              config: creds,
              pathname: `orga/business/live/${creds.appName}`,
              debugName: 'testing-waitForWorkerUp'
            });
            commandLogger.silly('Runner:waitForWorkerUp() -> fetch() -> ', res);
            if (this.isReady(res)) {
              commandLogger.silly('Runner:waitForWorkerUp() -> getStatus() -> READY', res);
              resolve();
              return;
            }
          }
        } catch (e) {
          commandLogger.silly('Runner:waitForWorkerUp() -> getStatus() FAILED', e);
          // retry later
        }
        setTimeout(getStatus, 300);
      };
      getStatus();
    });
  }

  private isReady(response: any) {
    const nodes = Object.values(response.nodes);
    return (
      this.localWorkerStarted &&
      nodes
        // { nodes: { str1: { items: { logs_0: { itemId: "logs", ...}, weak_0: { itemId: "weak", ... } } } }
        // -> [{ itemId: "logs", ...}, { itemId: "weak", ... }]
        .reduce((prev: any[], node: any) => prev.concat(Object.values(node.items) || []), [])
        .map((item) => item.liveData)
        .some((liveData: any) => liveData && liveData['queue.workers'] && liveData['queue.workers'].length > 0)
    );
  }

  stop() {
    return new Promise((resolve) => {
      ipc.server.stop();
      if (!this.cmd) {
        return resolve();
      }
      kill(this.cmd.pid, 'SIGTERM', () => {
        resolve();
      });
    });
  }

  run(quiet = false) {
    this.startIpcServer();
    commandLogger.info(`Runner:run() -> [npm run start -- ${zpLogLevel()} ${this.serveFront()} --ipc ${this.ipcId}]`);
    this.cmd = execa.shell(`npm run start -- ${zpLogLevel()} ${this.serveFront()} --ipc ${this.ipcId}`, {
      cwd: this.dir
    });
    if (this.cmd && !quiet) {
      this.cmd.stdout.pipe(new SubProcessLoggerStream('silly'));
      this.cmd.stderr.pipe(new SubProcessLoggerStream('warn'));
    }
    if (this.cmd) {
      this.cmd.once('close', (code) => (this.runExitCode = code));
    }
    return this.cmd;
  }

  private startIpcServer() {
    ipc.config.id = this.ipcId;
    ipc.config.retry = 1500;
    ipc.config.logger = commandLogger.silly;

    ipc.serve(() => {
      ipc.server.on('worker-started', (data: string, socket: Socket) => {
        this.localWorkerStarted = true;
      });
    });
    ipc.server.start();
  }

  private serveFront() {
    return this.frontOptions && this.frontOptions.serveFront ? '--serve-front' : '';
  }
}

export const zpLogLevel = () => {
  return process.env.ZETAPUSH_COMMANDS_LOG_LEVEL || '-vvv';
};
