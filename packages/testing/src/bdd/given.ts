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
import { existsSync } from 'fs';
import { createApplication } from '@zetapush/common';
import { Config } from '@zetapush/common';

export const given = () => new Given();

class Given {
  private sharedCredentials: Config;
  private givenCredentials?: GivenCredentials;
  private givenApp?: GivenApp;
  private givenWorker?: GivenWorker;

  constructor() {
    this.sharedCredentials = {};
  }

  /**
   * Configure developer account to use for testing the code.
   * The developer account will be used either to create new applications or to use existing applications.
   *
   * You can explicitly set login and password or choose to externalize credentials in environment variables (ZETAPUSH_DEVELOPER_LOGIN and ZETAPUSH_DEVELOPER_PASSWORD).
   */
  credentials() {
    this.givenCredentials = new GivenCredentials(this);
    return this.givenCredentials;
  }

  /**
   * Configure a directory that will be used as a container for an application (either a new application created through `npm init`
   * or a directory containing existing sources).
   */
  project() {
    this.givenApp = new GivenApp(this, this.sharedCredentials);
    return this.givenApp;
  }

  /**
   * Configure the behavior of the worker.
   *
   * The worker will be started in the application directory according to what you have configured for the application container/directory (see `app()`).
   */
  worker() {
    this.givenWorker = new GivenWorker(this);
    return this.givenWorker;
  }

  /**
   * Once you have prepare the environment for your test, call this method to run the given treatments.
   *
   * @param objToFill Any object you want that will be updated with useful information that will later
   * be used by other test utilities (generate a front that will automatically connect to the worker,
   * automatically delete the worker at the end of the test, ...)
   * @returns An object you want that will be updated with useful information that will later
   * be used by other test utilities (generate a front that will automatically connect to the worker,
   * automatically delete the worker at the end of the test, ...)
   */
  async apply(objToFill: any): Promise<TestContext> {
    try {
      givenLogger.debug(`>> Apply Given`);
      if (this.givenCredentials) {
        Object.assign(this.sharedCredentials, await this.givenCredentials.execute());
      }
      let projectDir;
      if (this.givenApp) {
        projectDir = await this.givenApp.execute();
      }
      if (this.givenWorker && !projectDir) {
        givenLogger.warn(
          "Can't start worker or read zetarc if there is no project directory provided. You may need to configure either newApp(), testingApp() or templatedApp()"
        );
      }
      let runner;
      if (this.givenWorker && projectDir) {
        runner = await this.givenWorker.execute(projectDir);
      }
      const zetarc = projectDir ? await readZetarc(projectDir) : this.sharedCredentials;
      const context = { zetarc, projectDir, runner };
      if (objToFill) {
        Object.assign(objToFill, {
          context
        });
      }
      if (projectDir) {
        envLogger.silly(`Current environment:`, getCurrentEnv(projectDir));
      }
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

class GivenApp extends Parent<Given> {
  private givenNewApp?: GivenNewApp;
  private givenTestingApp?: GivenTestingApp;
  private givenTemplate?: GivenTemplatedApp;

  constructor(parent: Given, private sharedCredentials: any) {
    super(parent);
  }

  /**
   * Create a new development project using `npm init @zetapush` command.
   *
   * The generated project will be located in `.generated-projects` folder.
   * You can choose the name of the sub-directory for the new project (by default 'new-project' is used).
   * You can also choose the appName to set into the `.zetarc` file (by default, a new application is created).
   */
  newProject() {
    this.givenNewApp = new GivenNewApp(this, this.sharedCredentials);
    return this.givenNewApp;
  }

  // /**
  //  * Use an existing folder that is ready to be tested. The directory is used as-is.
  //  * Only `.zetarc` file may be updated to use credentials provided by `credentials()` method.
  //  */
  // useExistingAppDirectory() {
  //   this.givenTestingApp = new GivenTestingApp(this, this.sharedCredentials);
  //   return this.givenTestingApp;
  // }

  /**
   * Use an existing folder that is copied in `.generated-projects` and then configured for the test.
   */
  template() {
    this.givenTemplate = new GivenTemplatedApp(this, this.sharedCredentials);
    return this.givenTemplate;
  }

  async execute(): Promise<string | undefined> {
    try {
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
      return projectDir;
    } catch (e) {
      throw e;
    }
  }
}

class GivenCredentials extends Parent<Given> {
  private url?: string;
  private developerLogin?: string;
  private developerPassword?: string;
  private appName?: string;
  private createApp = false;

  constructor(parent: Given) {
    super(parent);
    // default behavior uses the env variables
    this.url = process.env.ZETAPUSH_PLATFORM_URL;
  }

  fromEnv() {
    this.developerLogin = process.env.ZETAPUSH_DEVELOPER_LOGIN;
    this.developerPassword = process.env.ZETAPUSH_DEVELOPER_PASSWORD;
    this.url = process.env.ZETAPUSH_PLATFORM_URL;
    this.appName = process.env.ZETAPUSH_PLATFORM_APP_NAME;
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

  app(appName: string) {
    this.appName = appName;
    return this;
  }

  newApp() {
    this.createApp = true;
    return this;
  }

  async execute() {
    if (this.createApp) {
      const { appName } = await createApplication({
        developerLogin: this.developerLogin,
        developerPassword: this.developerPassword,
        platformUrl: this.url
      });
      this.appName = appName;
    }
    return {
      developerLogin: this.developerLogin,
      developerPassword: this.developerPassword,
      platformUrl: this.url,
      appName: this.appName
    };
  }
}

class GivenNewApp extends Parent<GivenApp> {
  private dirName = 'new-project';
  private setNewAppName = false;
  private newAppName?: string;

  constructor(parent: GivenApp, private credentials: any) {
    super(parent);
  }

  targetDir(dirName: string) {
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

class GivenTestingApp extends Parent<GivenApp> {
  private projectDirName?: string;
  private installLatestDependencies = false;

  constructor(parent: GivenApp, private credentials: any) {
    super(parent);
  }

  sourceDir(projectDirName: string) {
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

class GivenTemplatedApp extends Parent<GivenApp> {
  private templateApp?: string;

  constructor(parent: GivenApp, private credentials: any) {
    super(parent);
  }

  sourceDir(templateAppDir: string) {
    this.templateApp = templateAppDir;
    return this;
  }

  async execute() {
    try {
      givenLogger.info(`>>> Given templated application: templates/${this.templateApp}`);

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
        if (existsSync('.generated-projects/' + this.templateApp)) {
          await setAccountToZetarc(
            `.generated-projects/${this.templateApp}`,
            this.credentials.developerLogin,
            this.credentials.developerPassword
          );
          await setPlatformUrlToZetarc(`.generated-projects/${this.templateApp}`, this.credentials.platformUrl);
        } else {
          createZetarc(
            this.credentials.developerLogin,
            this.credentials.developerPassword,
            '.generated-projects/' + this.templateApp,
            this.credentials.platformUrl
          );
        }
      }
      return '.generated-projects/' + this.templateApp;
    } catch (e) {
      givenLogger.error(`>>> Given templated application FAILED: templates/${this.templateApp}`, e);
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
