const copydir = require('copy-dir');
const {
  rm,
  npmInit,
  zetaPush,
  readZetarc,
  Runner,
  createZetarc,
  npmInstallLatestVersion,
  nukeApp,
  setAccountToZetarc,
  setAppNameToZetarc,
  getCurrentEnv,
  setPlatformUrlToZetarc
} = require('./commands');
const { WeakClient } = require('@zetapush/client');
const transports = require('@zetapush/cometd/lib/node/Transports');
const {
  userActionLogger,
  givenLogger,
  frontUserActionLogger,
  cleanLogger,
  envLogger,
} = require('./logger');

const given = () => {
  return new Given();
};

const userAction = async (name, func) => {
  try {
    userActionLogger.info(`>>> User action: ${name}`);
    const res = await func();
    userActionLogger.info(`>>> User action DONE: ${name}`);
    return res;
  } catch (e) {
    userActionLogger.error(`>>> User action FAILED: ${name}`, e);
    throw e;
  }
};

const consoleUserAction = async (name, func) => {
  return await userAction(name + ' from console', func);
};

const frontUserAction = async (name, testOrContext, func) => {
  return await userAction(name + ' from front', async () => {
    let api;
    let client;
    try {
      const zetarc = testOrContext.zetarc || testOrContext.context.zetarc;
      client = new WeakClient({
        ...zetarc,
        transports,
      });
      frontUserActionLogger.debug('Connecting to worker...');
      await client.connect();
      frontUserActionLogger.debug('Connected to worker');
      api = client.createProxyTaskService();
      frontUserActionLogger.debug('Api instance created');
    } catch (e) {
      frontUserActionLogger.error(
        "Connection from client failed. Cloud service won't be called",
        e,
      );
      throw e;
    }
    try {
      return await func(api, client);
    } catch (e) {
      frontUserActionLogger.error(
        `>>> Front user action FAILED: ${name}`,
        testOrContext.context || testOrContext,
        e,
      );
      throw e;
    }
  });
};

const autoclean = async (testOrContext) => {
  const context = testOrContext.projectDir
    ? testOrContext
    : testOrContext.context;
  if (context && context.projectDir) {
    try {
      return await nukeApp(context.projectDir);
    } catch (e) {
      cleanLogger.warn('Failed to autoclean (nukeApp). Skipping the error.', e);
    }
  } else {
    cleanLogger.debug('Skipping autoclean (nukeApp).', testOrContext);
  }
};

class Given {
  constructor() {
    this.sharedCredentials = {};
  }

  credentials() {
    this.givenCredentials = new GivenCredentials(this);
    return this.givenCredentials;
  }

  newApp() {
    this.givenNewApp = new GivenNewApp(this, this.sharedCredentials);
    return this.givenNewApp;
  }

  testingApp() {
    this.givenTestingApp = new GivenTestingApp(this, this.sharedCredentials);
    return this.givenTestingApp;
  }

  templatedApp() {
    this.givenTemplate = new GivenTemplatedApp(this, this.sharedCredentials);
    return this.givenTemplate;
  }

  worker() {
    this.givenWorker = new GivenWorker(this);
    return this.givenWorker;
  }

  async apply(objToFill) {
    try {
      givenLogger.debug(`>> Apply Given`);
      if (this.givenCredentials) {
        Object.assign(this.sharedCredentials, await this.givenCredentials.execute());
      }
      let projectDir;
      if (this.givenNewApp) {
        projectDir = await this.givenNewApp.execute();
      }
      if (this.givenTestingApp) {
        projectDir = await this.givenTestingApp.execute();
      }
      if (this.givenTemplate) {
        projectDir = await this.givenTemplate.execute();
      }
      let runner;
      if (this.givenWorker) {
        runner = await this.givenWorker.execute(projectDir);
      }
      const zetarc = await readZetarc(projectDir);
      if (objToFill) {
        Object.assign(objToFill, {
          context: {
            zetarc,
            projectDir,
            runner,
          },
        });
      }
      envLogger.silly(
        `Current environment:`,
        getCurrentEnv(projectDir),
      );
      givenLogger.debug(`>> Apply Given DONE`);
      return {
        zetarc,
        projectDir,
        runner,
      };
    } catch (e) {
      givenLogger.error(`>> Apply Given FAILED`, e);
      throw e;
    }
  }
}

class Parent {
  constructor(parent) {
    this.parent = parent;
  }

  and() {
    return this.parent;
  }
}

class GivenCredentials extends Parent {
  constructor(parent) {
    super(parent);
    // default behavior uses the env variables
    this.url = process.env.ZETAPUSH_PLATFORM_URL;
  }

  fromEnv() {
    this.developerLogin = process.env.ZETAPUSH_DEVELOPER_LOGIN;
    this.developerPassword = process.env.ZETAPUSH_DEVELOPER_PASSWORD;
    this.url = process.env.ZETAPUSH_PLATFORM_URL;
    return this;
  }

  login(developerLogin) {
    this.developerLogin = developerLogin;
    return this;
  }

  password(developerPassword) {
    this.developerPassword = developerPassword;
    return this;
  }

  platformUrl(url) {
    this.url = url;
    return this;
  }

  async execute() {
    return {
      developerLogin: this.developerLogin,
      developerPassword: this.developerPassword,
      platformUrl: this.url
    };
  }
}

class GivenNewApp extends Parent {
  constructor(parent, credentials) {
    super(parent);
    this.credentials = credentials;
  }

  dir(dirName) {
    this.dirName = dirName;
    return this;
  }

  setAppName(newAppName) {
    this.setNewAppName = true;
    this.newAppName = newAppName;
    return this;
  }

  async execute() {
    try {
      givenLogger.info(
        `>>> Given new application: .generated-projects/${this.dirName}`,
      );

      givenLogger.silly(
        `GivenNewApp:execute -> rm(.generated-projects/${this.dirName})`,
      );
      await rm(`.generated-projects/${this.dirName}`);

      const projectDir = `.generated-projects/${this.dirName}`;
      givenLogger.silly(
        `GivenNewApp:execute -> npmInit(${this.credentials.developerLogin},
          ${this.credentials.developerPassword}, .generated-projects/${
          this.dirName
        })`,
      );
      await npmInit(
        this.credentials.developerLogin,
        this.credentials.developerPassword,
        projectDir,
        this.credentials.platformUrl
      );
      if (this.setNewAppName) {
        givenLogger.silly(
          `GivenNewApp:execute -> setAppNameToZetarc(.generated-projects/${
            this.dirName
          }, ${this.newAppName})`,
        );
        await setAppNameToZetarc(projectDir, this.newAppName);
      }
      return projectDir;
    } catch (e) {
      givenLogger.error(
        `>>> Given new application FAILED: .generated-projects/${this.dirName}`,
        e,
      );
      throw e;
    }
  }
}

class GivenTestingApp extends Parent {
  constructor(parent, credentials) {
    super(parent);
    this.credentials = credentials;
  }

  projectName(projectDirName) {
    this.projectDirName = projectDirName;
    return this;
  }

  latestVersion() {
    this.installLatestDependencies = true;
    return this;
  }

  async execute() {
    try {
      givenLogger.info(
        `>>> Given testing application: testing-projects/${
          this.projectDirName
        }`,
      );

      if (this.projectDirName && this.installLatestDependencies) {
        givenLogger.silly(
          `GivenTestingApp:execute -> npmInstallLatestVersion(testing-projects/${
            this.projectDirName
          })`,
        );
        await npmInstallLatestVersion(
          `testing-projects/${this.projectDirName}`,
        );
      }
      if (this.credentials) {
        givenLogger.silly(
          `GivenTestingApp:execute -> setAccountToZetarc(testing-projects/${
            this.projectDirName
          }, ${JSON.stringify(this.credentials)})`,
        );
        await setAccountToZetarc(
          `testing-projects/${this.projectDirName}`,
          this.credentials.developerLogin,
          this.credentials.developerPassword
        );
        await setPlatformUrlToZetarc(`testing-projects/${this.projectDirName}`, this.credentials.platformUrl);
      }
      return `testing-projects/${this.projectDirName}`;
    } catch (e) {
      givenLogger.error(
        `>>> Given testing application FAILED: testing-projects/${
          this.projectDirName
        }`,
        e,
      );
      throw e;
    }
  }
}

class GivenTemplatedApp extends Parent {
  constructor(parent, credentials) {
    super(parent);
    this.credentials = credentials;
  }

  dir(templateAppDir) {
    this.templateApp = templateAppDir;
    return this;
  }

  async execute() {
    try {
      givenLogger.info(
        `>>> Given templated application: testing-projects/${this.templateApp}`,
      );

      givenLogger.silly(
        `GivenTemplatedApp:execute -> rm(.generated-projects/${
          this.templateApp
        })`,
      );
      await rm(`.generated-projects/${this.templateApp}`);

      givenLogger.silly(
        `GivenTemplatedApp:execute -> copydir.sync(spec/templates/${
          this.templateApp
        }, .generated-projects/${this.templateApp})`,
      );
      copydir.sync(
        'spec/templates/' + this.templateApp,
        '.generated-projects/' + this.templateApp,
      );
      if (this.credentials) {
        givenLogger.silly(
          `GivenTemplatedApp:execute -> createZetarc(${
            this.credentials.developerLogin
          }, ${this.credentials.developerPassword}, .generated-projects/${
            this.templateApp
          })`,
        );
        createZetarc(
          this.credentials.developerLogin,
          this.credentials.developerPassword,
          '.generated-projects/' + this.templateApp,
          this.credentials.platformUrl,
        );
      }
      return '.generated-projects/' + this.templateApp;
    } catch (e) {
      givenLogger.error(
        `>>> Given templated application FAILED: testing-projects/${
          this.templateApp
        }`,
        e,
      );
      throw e;
    }
  }
}

class GivenWorker extends Parent {
  constructor(parent) {
    super(parent);
  }

  runner() {
    this.createRunner = true;
    return this;
  }

  up(timeout) {
    this.workerUp = true;
    this.timeout = timeout;
    return this;
  }

  quiet() {
    this.isQuiet = true;
    return this;
  }

  async execute(currentDir) {
    try {
      if (this.createRunner) {
        return new Runner(currentDir);
      }
      if (this.workerUp) {
        givenLogger.info(
          `>>> Given worker: run and wait for worker up ${currentDir}`,
        );
        const runner = new Runner(currentDir, this.timeout);
        runner.run(this.isQuiet);
        await runner.waitForWorkerUp();
        return runner;
      }
    } catch (e) {
      givenLogger.error(`>>> Given worker: FAILED ${currentDir}`, e);
      throw e;
    }
  }
}

module.exports = {
  given,
  userAction,
  autoclean,
  consoleUserAction,
  frontUserAction,
};
