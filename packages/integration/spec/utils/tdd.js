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
} = require('./commands');
const { WeakClient } = require('@zetapush/client');
const transports = require('@zetapush/cometd/lib/node/Transports');

const given = () => {
  return new Given();
};

const userAction = async (name, func) => {
  try {
    console.log();
    console.log();
    console.log(`>>> User action: ${name}`);
    return await func();
  } catch (e) {
    console.log(`>>> User action FAILED: ${name}`, e);
    throw e;
  }
};

const consoleUserAction = async (name, func) => {
  return await userAction(name + ' from console', func);
};

const frontUserAction = async (name, context, func) => {
  return await userAction(name + ' from front', async () => {
    let api;
    let client;
    try {
      const zetarc = context.zetarc;
      client = new WeakClient({
        ...zetarc,
        transports,
      });
      console.log('Connecting to worker...');
      await client.connect();
      console.log('Connected to worker');
      api = client.createProxyTaskService();
    } catch (e) {
      console.error(
        "Connection from client failed. Cloud service won't be called",
        e,
      );
      throw e;
    }
    try {
      await func(api, client);
    } catch (e) {
      console.log(`>>> Front user action FAILED: ${name}`, context, e);
      throw e;
    }
  });
};

const autoclean = async (givenContext) => {
  if (givenContext && givenContext.projectDir) {
    try {
      return await nukeApp(givenContext.projectDir);
    } catch (e) {
      console.warn('Failed to autoclean (nukeApp). Skipping the error', e);
    }
  } else {
    console.log('Skipping autoclean (nukeApp)', givenContext);
  }
};

class Given {
  constructor() {
    this.creds = {};
  }

  credentials() {
    this.givenCredentials = new GivenCredentials(this);
    return this.givenCredentials;
  }

  newApp() {
    this.givenNewApp = new GivenNewApp(this, this.creds);
    return this.givenNewApp;
  }

  testingApp() {
    this.givenTestingApp = new GivenTestingApp(this, this.creds);
    return this.givenTestingApp;
  }

  templatedApp() {
    this.givenTemplate = new GivenTemplatedApp(this, this.creds);
    return this.givenTemplate;
  }

  worker() {
    this.givenWorker = new GivenWorker(this);
    return givenWorker;
  }

  async apply(objToFill) {
    try {
      console.log(`>> Apply Given`);
      if (this.givenCredentials) {
        const creds = await this.givenCredentials.execute();
        this.creds.developerLogin = creds.developerLogin;
        this.creds.developerPassword = creds.developerPassword;
      }
      let currentDir;
      if (this.givenNewApp) {
        currentDir = await this.givenNewApp.execute();
      }
      if (this.givenTestingApp) {
        currentDir = await this.givenTestingApp.execute();
      }
      if (this.givenTemplate) {
        currentDir = await this.givenTemplate.execute();
      }
      let runner;
      if (this.givenWorker) {
        runner = await this.givenWorker.execute(currentDir);
      }
      const zetarc = await readZetarc(currentDir);
      if (objToFill) {
        objToFill.zetarc = zetarc;
        objToFill.projectDir = currentDir;
        objToFill.runner = runner;
      }
      return {
        zetarc,
        projectDir: currentDir,
        runner,
      };
    } catch (e) {
      console.error(`>> Apply Given FAILED`, e);
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
  }

  fromEnv() {
    this.developerLogin = process.env.ZETAPUSH_DEVELOPER_LOGIN;
    this.developerPassword = process.env.ZETAPUSH_DEVELOPER_PASSWORD;
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

  async execute() {
    return {
      developerLogin: this.developerLogin,
      developerPassword: this.developerPassword,
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
      console.log(
        `>>> Given new application: .generated-projects/${this.dirName}`,
      );

      const projectDir = `.generated-projects/${this.dirName}`;
      await npmInit(
        this.credentials.developerLogin,
        this.credentials.developerPassword,
        projectDir,
      );
      if (this.setNewAppName) {
        await setAppNameToZetarc(projectDir, this.newAppName);
      }
      return projectDir;
    } catch (e) {
      console.error(
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
      console.log(
        `>>> Given testing application: testing-projects/${
          this.projectDirName
        }`,
      );

      if (this.projectDirName && this.installLatestDependencies) {
        console.log(
          `GivenTestingApp:execute -> npmInstallLatestVersion(testing-projects/${
            this.projectDirName
          })`,
        );
        await npmInstallLatestVersion(
          `testing-projects/${this.projectDirName}`,
        );
      }
      if (
        this.credentials &&
        this.credentials.developerLogin &&
        this.credentials.developerPassword
      ) {
        console.log(
          `GivenTestingApp:execute -> setAccountToZetarc(testing-projects/${
            this.projectDirName
          }, ${JSON.stringify(this.credentials)})`,
        );
        await setAccountToZetarc(
          `testing-projects/${this.projectDirName}`,
          this.credentials.developerLogin,
          this.credentials.developerPassword,
        );
      }
      return `testing-projects/${this.projectDirName}`;
    } catch (e) {
      console.error(
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
      console.log(
        `>>> Given templated application: testing-projects/${this.templateApp}`,
      );

      console.log(
        `GivenTemplatedApp:execute -> copydir.sync(spec/templates/${
          this.templateApp
        }, .generated-projects/${this.templateApp})`,
      );
      copydir.sync(
        'spec/templates/' + this.templateApp,
        '.generated-projects/' + this.templateApp,
      );
      if (
        this.credentials &&
        this.credentials.developerLogin &&
        this.credentials.developerPassword
      ) {
        console.log(
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
        );
      }
      return '.generated-projects/' + this.templateApp;
    } catch (e) {
      console.error(
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

  up() {
    this.workerUp = true;
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
        console.log(
          `>>> Given worker: run and wait for worker up ${currentDir}`,
        );
        const runner = new Runner(currentDir);
        runner.run(this.isQuiet);
        await runner.waitForWorkerUp();
        return runner;
      }
    } catch (e) {
      console.log(`>>> Given worker: FAILED ${currentDir}`, e);
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
