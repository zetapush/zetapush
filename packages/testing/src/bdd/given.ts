import { givenLogger, envLogger } from '../utils/logger';
import {
  readZetarc,
  rm,
  npmInit,
  setAppNameToZetarc,
  npmInstallLatestVersion,
  setAccountToZetarc,
  setPlatformUrlToZetarc,
  createZetarc,
  Runner,
  getCurrentEnv
} from '../utils/commands';
import copydir from 'copy-dir';
import { TestContext, Test } from '../utils/types';

export const given = () => new Given();

class Given {
  private sharedCredentials: any;
  private givenCredentials?: GivenCredentials;
  private givenNewApp?: GivenNewApp;
  private givenTestingApp?: GivenTestingApp;
  private givenTemplate?: GivenTemplatedApp;
  private givenWorker?: GivenWorker;

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

  async apply(objToFill: any): Promise<TestContext> {
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
      if (!projectDir) {
        throw new Error(
          "Can't start worker or read zetarc if there is no project directory provided. You may need to configure either newApp(), testingApp() or templatedApp()"
        );
      }
      let runner;
      if (this.givenWorker) {
        runner = await this.givenWorker.execute(projectDir);
      }
      const zetarc = await readZetarc(projectDir);
      const context = { zetarc, projectDir, runner };
      if (objToFill) {
        Object.assign(objToFill, {
          context
        });
      }
      envLogger.silly(`Current environment:`, getCurrentEnv(projectDir));
      givenLogger.debug(`>> Apply Given DONE`);
      return context;
    } catch (e) {
      givenLogger.error(`>> Apply Given FAILED`, e);
      throw e;
    }
  }
}

class Parent<P> {
  constructor(private parent: P) {}

  and() {
    return this.parent;
  }
}

class GivenCredentials extends Parent<Given> {
  private url?: string;
  private developerLogin?: string;
  private developerPassword?: string;

  constructor(parent: Given) {
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

  login(developerLogin: string) {
    this.developerLogin = developerLogin;
    return this;
  }

  password(developerPassword: string) {
    this.developerPassword = developerPassword;
    return this;
  }

  platformUrl(url: string) {
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

class GivenNewApp extends Parent<Given> {
  private dirName?: string;
  private setNewAppName = false;
  private newAppName?: string;

  constructor(parent: Given, private credentials: any) {
    super(parent);
  }

  dir(dirName: string) {
    this.dirName = dirName;
    return this;
  }

  setAppName(newAppName: string) {
    this.setNewAppName = true;
    this.newAppName = newAppName;
    return this;
  }

  async execute() {
    try {
      givenLogger.info(`>>> Given new application: .generated-projects/${this.dirName}`);

      givenLogger.silly(`GivenNewApp:execute -> rm(.generated-projects/${this.dirName})`);
      await rm(`.generated-projects/${this.dirName}`);

      const projectDir = `.generated-projects/${this.dirName}`;
      givenLogger.silly(
        `GivenNewApp:execute -> npmInit(${this.credentials.developerLogin},
          ${this.credentials.developerPassword}, .generated-projects/${this.dirName})`
      );
      await npmInit(
        this.credentials.developerLogin,
        this.credentials.developerPassword,
        projectDir,
        this.credentials.platformUrl
      );
      if (this.setNewAppName && this.newAppName) {
        givenLogger.silly(
          `GivenNewApp:execute -> setAppNameToZetarc(.generated-projects/${this.dirName}, ${this.newAppName})`
        );
        await setAppNameToZetarc(projectDir, this.newAppName);
      }
      return projectDir;
    } catch (e) {
      givenLogger.error(`>>> Given new application FAILED: .generated-projects/${this.dirName}`, e);
      throw e;
    }
  }
}

class GivenTestingApp extends Parent<Given> {
  private projectDirName?: string;
  private installLatestDependencies = false;

  constructor(parent: Given, private credentials: any) {
    super(parent);
  }

  projectName(projectDirName: string) {
    this.projectDirName = projectDirName;
    return this;
  }

  latestVersion() {
    this.installLatestDependencies = true;
    return this;
  }

  async execute() {
    try {
      givenLogger.info(`>>> Given testing application: testing-projects/${this.projectDirName}`);

      if (this.projectDirName && this.installLatestDependencies) {
        givenLogger.silly(
          `GivenTestingApp:execute -> npmInstallLatestVersion(testing-projects/${this.projectDirName})`
        );
        await npmInstallLatestVersion(`testing-projects/${this.projectDirName}`);
      }
      if (this.credentials) {
        givenLogger.silly(
          `GivenTestingApp:execute -> setAccountToZetarc(testing-projects/${this.projectDirName}, ${JSON.stringify(
            this.credentials
          )})`
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
      givenLogger.error(`>>> Given testing application FAILED: testing-projects/${this.projectDirName}`, e);
      throw e;
    }
  }
}

class GivenTemplatedApp extends Parent<Given> {
  private templateApp?: string;

  constructor(parent: Given, private credentials: any) {
    super(parent);
  }

  dir(templateAppDir: string) {
    this.templateApp = templateAppDir;
    return this;
  }

  async execute() {
    try {
      givenLogger.info(`>>> Given templated application: testing-projects/${this.templateApp}`);

      givenLogger.silly(`GivenTemplatedApp:execute -> rm(.generated-projects/${this.templateApp})`);
      await rm(`.generated-projects/${this.templateApp}`);

      givenLogger.silly(
        `GivenTemplatedApp:execute -> copydir.sync(spec/templates/${this.templateApp}, .generated-projects/${
          this.templateApp
        })`
      );
      copydir.sync('spec/templates/' + this.templateApp, '.generated-projects/' + this.templateApp);
      await npmInstallLatestVersion(`.generated-projects/${this.templateApp}`);

      if (this.credentials) {
        givenLogger.silly(
          `GivenTemplatedApp:execute -> createZetarc(${this.credentials.developerLogin}, ${
            this.credentials.developerPassword
          }, .generated-projects/${this.templateApp})`
        );
        createZetarc(
          this.credentials.developerLogin,
          this.credentials.developerPassword,
          '.generated-projects/' + this.templateApp,
          this.credentials.platformUrl
        );
      }
      return '.generated-projects/' + this.templateApp;
    } catch (e) {
      givenLogger.error(`>>> Given templated application FAILED: testing-projects/${this.templateApp}`, e);
      throw e;
    }
  }
}

class GivenWorker extends Parent<Given> {
  private createRunner = false;
  private workerUp = false;
  private timeout?: number;
  private isQuiet = false;

  constructor(parent: Given) {
    super(parent);
  }

  runner() {
    this.createRunner = true;
    return this;
  }

  up(timeout: number) {
    this.workerUp = true;
    this.timeout = timeout;
    return this;
  }

  quiet() {
    this.isQuiet = true;
    return this;
  }

  async execute(currentDir: string) {
    try {
      if (this.createRunner) {
        return new Runner(currentDir);
      }
      if (this.workerUp) {
        givenLogger.info(`>>> Given worker: run and wait for worker up ${currentDir}`);
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
