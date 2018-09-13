import { existsSync, readFileSync, writeFileSync } from 'fs';

import { Config } from '@zetapush/common';

import copydir from 'copy-dir';

import { givenLogger, envLogger, getLogLevelsFromEnv } from '../utils/logger';
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
  getCurrentEnv,
  npmInstall,
  zetaPush
} from '../utils/commands';
import { TestContext, Dependencies } from '../utils/types';
import { createApplication, DEFAULTS } from '@zetapush/common';
import { InjectionToken, Module } from '@zetapush/core';
const fp = require('find-free-port');
const execa = require('execa');
const fs = require('fs');
const os = require('os');
const { join } = require('path')
const yaml = require('js-yaml')


export const given = () => new Given();

class Given {
  private sharedCredentials: Config;
  private givenCredentials?: GivenCredentials;
  private givenApp?: GivenApp;
  private givenWorker?: GivenWorker;
  private givenDependencies?: GivenDependencies;

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
   * Configure the behavior for the dependencies installation
   * 
   * We can specify to use the npm dependencies (default case) or to use the local dependencies
   */
  npmDependencies() {
    this.givenDependencies = new GivenDependencies(this);
    return this.givenDependencies;
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
      
      let projectDir;
      let localNpmRegistry;
      if (this.givenDependencies) {
        localNpmRegistry = await this.givenDependencies.execute();
      }
      
      givenLogger.debug(`>> Apply Given`);
      if (this.givenCredentials) {
        Object.assign(this.sharedCredentials, await this.givenCredentials.execute());
      }
      if (this.givenApp) {
        projectDir = await this.givenApp.execute(localNpmRegistry);
      }
      let runnerAndDeps;
      if (this.givenWorker) {
        runnerAndDeps = await this.givenWorker.execute(projectDir, localNpmRegistry);
      }

      const zetarc = projectDir ? await readZetarc(projectDir) : this.sharedCredentials;
      const context = {
        zetarc,
        projectDir,
        ...runnerAndDeps,
        logLevel: getLogLevelsFromEnv()
      };
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

class GivenDependencies extends Parent<Given> {
  private localDependencies: string[] = [];
  private useNpmDependencies: boolean = true;
  

  constructor(parent: Given) {
    super(parent)
  }

  /**
   * Use the npm proxy to download dependencies
   */
  npmProxy() {
    this.localDependencies = [];
    this.useNpmDependencies = true;
    return this;
  }
  
  /**
   * Use the local dependencies
   * 
   * You can specifie the list of dependencies with different ways :
   *  - Using the full path of the dependency (ex: /home/ubuntu/myDep)
   *  - Using the full path of the parent directory to get all dependencies inside it (ex: /home/ubuntu/*)
   *  - Use relative path (ex: ../myDep)
   *  - Use relative path of the parent directory to get all dependencies inside it (ex: ../*)
   * 
   * @param dependencies list of dependencies we want to use from local proxy
   */
  localProxy(...dependencies: string[]) {

    // Iterate on each parameters to add all local dependencies
    dependencies.forEach((dep) => {
      // Get all dependencies of subdirectory
      const pathAsArray = dep.split("/");
      if (pathAsArray.pop() === "*") {
        const realPath = fs.realpathSync(pathAsArray.slice(-1).join('/'));
        const subdirectories = fs.readdirSync(realPath);
        for (let elt of subdirectories) {
          const pathWithPackageJson = join(realPath, elt, 'package.json');
          if (fs.existsSync(pathWithPackageJson)) {
            this.localDependencies.push(join(realPath, elt));
          } 
        }
      } else {
        const realPath = fs.realpathSync(dep);
        if (fs.existsSync(realPath)) {
          // Check if the dependency is a package
          const pathWithPackageJson = join(realPath, 'package.json');
          if (fs.existsSync(pathWithPackageJson)) {
            this.localDependencies.push(realPath);
          } 
        }
      }      
    });
    
    this.useNpmDependencies = false;
    return this;
  }

  async execute(): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      if (!this.useNpmDependencies) {
        // FIXME: WORKS ONLY ON 4873 PORT ! BUG WITH VERDACCIO
        const freePort = (await fp(4873))[0];
  
        const configVerdaccio = {
          storage: "./storage",
          packages: {
            '@*/*': {
              access: '$all',
              publish: '$all',
              proxy: 'npmjs'
            },
            '**': {
              access: '$all',
              publish: '$all',
              proxy: 'npmjs'
            }
          },
          uplinks: {
            npmjs: {
              url: 'https://registry.npmjs.org'
            }
          }
        }
  
        const fileConfigVerdaccio = yaml.safeDump(configVerdaccio);
        const pathConfigVerdaccio = join(os.tmpdir(), `config-verdaccio-${new Date().getTime()}.yaml`);
        fs.writeFileSync(pathConfigVerdaccio, fileConfigVerdaccio);
  
        execa(`verdaccio`, ['--listen', freePort, '--config', pathConfigVerdaccio]);
        givenLogger.debug(`>> Verdaccion launched on port : ${freePort}`);
        
        this.localDependencies.forEach(async (localDep) => {

          const packageJsonLocalDependency = JSON.parse(fs.readFileSync(join(localDep, 'package.json')));
            
          if (packageJsonLocalDependency.version && !packageJsonLocalDependency.private === true) {
            // Update the version of the package to publish it on the private repository
            const currentVersionPackage = packageJsonLocalDependency.version;
  
            packageJsonLocalDependency.version += '-' + new Date().getTime();
              
            // Push the updated package in the private repository
            try {
              fs.writeFileSync(join(localDep, 'package.json'), JSON.stringify(packageJsonLocalDependency, null, 2));
      
              await execa('npm', ['publish', '--registry', `http://localhost:${freePort}`], {
                cwd: localDep
              })
            } finally {
              // Update the package version with the previous, once it was published
              packageJsonLocalDependency.version = currentVersionPackage;
              fs.writeFileSync(join(localDep, 'package.json'), JSON.stringify(packageJsonLocalDependency, null, 2));
            }
            resolve(`http://localhost:${freePort}`)
          }
        })
      } else {
        reject(`Failed to deploy local npm dependencies on private registry`);
      }
    });

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

  async execute(localNpmRegistry?: string): Promise<string | undefined> {
    try {
      let projectDir;
      if (this.givenNewApp) {
        projectDir = await this.givenNewApp.execute(localNpmRegistry);
      }
      if (this.givenTestingApp) {
        projectDir = await this.givenTestingApp.execute(localNpmRegistry);
      }
      if (this.givenTemplate) {
        projectDir = await this.givenTemplate.execute(localNpmRegistry);
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
    this.url = process.env.ZETAPUSH_PLATFORM_URL || DEFAULTS.PLATFORM_URL;
  }

  fromEnv() {
    this.developerLogin = process.env.ZETAPUSH_DEVELOPER_LOGIN;
    this.developerPassword = process.env.ZETAPUSH_DEVELOPER_PASSWORD;
    this.url = process.env.ZETAPUSH_PLATFORM_URL || DEFAULTS.PLATFORM_URL;
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
  private projectDir = `.generated-projects/${this.dirName}`;

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

  async execute(localNpmRegistry?: string) {
    try {
      givenLogger.info(`>>> Given new application: ${this.projectDir}`);

      givenLogger.silly(`GivenNewApp:execute -> rm(${this.projectDir})`);
      await rm(`${this.projectDir}`);

      givenLogger.silly(
        `GivenNewApp:execute -> npmInit(${this.credentials.developerLogin},
          ${this.credentials.developerPassword}, ${this.projectDir})`
      );
      await npmInit(
        this.credentials.developerLogin,
        this.credentials.developerPassword,
        this.projectDir,
        this.credentials.platformUrl,
        localNpmRegistry
      );
      if (this.setNewAppName && this.newAppName) {
        givenLogger.silly(
          `GivenNewApp:execute -> setAppNameToZetarc(${this.projectDir}, ${this.newAppName})`
        );
        await setAppNameToZetarc(this.projectDir, this.newAppName);
      }
      return this.projectDir;
    } catch (e) {
      givenLogger.error(`>>> Given new application FAILED: ${this.projectDir}`, e);
      throw e;
    }
  }
}

class GivenTestingApp extends Parent<GivenApp> {
  private projectDirName?: string;
  private installLatestDependencies = false;
  private projectDir = `testing-projects/${this.projectDirName}`;

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

  async execute(localNpmRegistry?: string) {
    try {
      givenLogger.info(`>>> Given testing application: ${this.projectDir}`);

      if (this.projectDirName && this.installLatestDependencies) {
        givenLogger.silly(
          `GivenTestingApp:execute -> npmInstallLatestVersion(${this.projectDir})`
        );
        await npmInstallLatestVersion(this.projectDir, localNpmRegistry);
      }
      if (this.credentials) {
        givenLogger.silly(
          `GivenTestingApp:execute -> setAccountToZetarc(${this.projectDir}, ${JSON.stringify(
            this.credentials
          )})`
        );
        await setAccountToZetarc(
          this.projectDir,
          this.credentials.developerLogin,
          this.credentials.developerPassword
        );
        await setPlatformUrlToZetarc(this.projectDir, this.credentials.platformUrl);
      }
      return this.projectDir;
    } catch (e) {
      givenLogger.error(`>>> Given testing application FAILED: ${this.projectDir}`, e);
      throw e;
    }
  }
}

class GivenTemplatedApp extends Parent<GivenApp> {
  private templateApp?: string;
  private projectDir = `.generated-projects/${this.templateApp}`;

  constructor(parent: GivenApp, private credentials: any) {
    super(parent);
  }

  sourceDir(templateAppDir: string) {
    this.templateApp = templateAppDir;
    this.projectDir = `.generated-projects/${this.templateApp}`;
    return this;
  }

  async execute(localNpmRegistry?: string) {
    try {
      givenLogger.info(`>>> Given templated application: templates/${this.templateApp}`);

      givenLogger.silly(`GivenTemplatedApp:execute -> rm(${this.projectDir})`);
      await rm(this.projectDir);

      givenLogger.silly(
        `GivenTemplatedApp:execute -> copydir.sync(spec/templates/${this.templateApp}, ${this.projectDir})`
      );
      copydir.sync('spec/templates/' + this.templateApp, this.projectDir);
      // await npmInstallLatestVersion(this.projectDir);
      await npmInstall(this.projectDir, '*', localNpmRegistry);

      if (this.credentials) {
        givenLogger.silly(
          `GivenTemplatedApp:execute -> createZetarc(${this.credentials.developerLogin}, ${
            this.credentials.developerPassword
          }, ${this.projectDir})`
        );
        if (existsSync(this.projectDir)) {
          await setAccountToZetarc(
            this.projectDir,
            this.credentials.developerLogin,
            this.credentials.developerPassword
          );
          await setPlatformUrlToZetarc(this.projectDir, this.credentials.platformUrl);
        } else {
          createZetarc(
            this.credentials.developerLogin,
            this.credentials.developerPassword,
            this.projectDir,
            this.credentials.platformUrl
          );
        }
      }
      return this.projectDir;
    } catch (e) {
      givenLogger.error(`>>> Given templated application FAILED: templates/${this.templateApp}`, e);
      throw e;
    }
  }
}

class GivenWorker extends Parent<Given> {
  private createRunner = false;
  private workerUp = false;
  private workerPushed = false;
  private timeout?: number;
  private isQuiet = false;
  private moduleDeclaration?: () => Promise<Module>;
  private deps?: Dependencies;
  // private provs?: Provider[];
  // private configurationFunc?: ConfigurationFunction;

  constructor(parent: Given) {
    super(parent);
  }

  /**
   * Create a runner instance before executing the test
   */
  runner() {
    this.createRunner = true;
    return this;
  }

  /**
   * Wait for the worker to be up before executing the test
   */
  up(timeout: number) {
    this.workerUp = true;
    this.timeout = timeout;
    return this;
  }

  /**
   * Push the worker and Wait for the worker to be up before executing the test
   */
  pushed(timeout: number) {
    this.workerPushed = true;
    this.timeout = timeout;
    return this;
  }

  /**
   * The worker runs in quiet mode (less output in console/logs)
   */
  quiet() {
    this.isQuiet = true;
    return this;
  }

  /**
   * Indicates the dependencies that are used in the test. The dependencies are injected in
   * the function run by `runInWorker`. This is useful to retrieve an instance constructed
   * by dependency injection.
   *
   * @param deps the dependencies that must be injected in the test (@see runInWorker function)
   */
  dependencies(...deps: Array<Function | InjectionToken<any>>): GivenWorker {
    this.deps = deps;
    return this;
  }

  /**
   * This function is like `dependencies` except that instead of using an array, it uses
   * a function that will be called later. This is mandatory when using `scopedDependency`
   * function.
   *
   * @param func a function that will provide the dependencies that must be injected in the test (@see runInWorker function)
   */
  dependenciesWithScope(func: () => Array<Function | InjectionToken<any>>): GivenWorker {
    this.deps = func;
    return this;
  }

  // /**
  //  * When you are using Cloud Services, you may want to override a particular implementation
  //  * with your own. You can do so by registering a provider.
  //  *
  //  * @param providers list of providers to override default providers
  //  */
  // providers(...providers: Provider[]) {
  //   this.provs = providers;
  //   return this;
  // }

  // /**
  //  * This function is used to configure the Cloud Service you want to test.
  //  *
  //  * @param func the function used to configure the worker (it MUST return an array of providers)
  //  */
  // configuration(func: ConfigurationFunction) {
  //   this.configurationFunc = func;
  //   return this;
  // }

  /**
   * Set the worker code that provides a module to be tested.
   * The module can provide several information (like a standard module):
   * - A list of configurers to instantiate
   * - A list of custom providers to override default providers
   * - A list of exposed services (that are explicitly instantiated)
   * - A list of modules to import
   *
   * @param moduleDeclaration A function that provide a module
   */
  testModule(moduleDeclaration: () => Promise<Module>) {
    this.moduleDeclaration = moduleDeclaration;
    return this;
  }

  async execute(currentDir?: string, localNpmRegistry?: string) {

    try {
      const deps = {
        moduleDeclaration: this.moduleDeclaration,
        dependencies: this.deps
      };
      if ((this.createRunner || this.workerUp) && !currentDir) {
        givenLogger.warn(
          "Can't start worker or read zetarc if there is no project directory provided. You may need to configure either project().newProject() or project().template()"
        );
      }
      if (this.createRunner && currentDir) {
        return {
          runner: !!localNpmRegistry ? new Runner(currentDir, 300000, localNpmRegistry) : new Runner(currentDir),
          ...deps
        };
      }
      if (this.workerUp && currentDir) {
        givenLogger.info(`>>> Given worker: run and wait for worker up ${currentDir}`);
        const runner = !!localNpmRegistry ? new Runner(currentDir, this.timeout, localNpmRegistry) : new Runner(currentDir, this.timeout);
        runner.run(this.isQuiet);
        await runner.waitForWorkerUp();
        return {
          runner,
          ...deps
        };
      }
      if (this.workerPushed && currentDir) {
        givenLogger.info(`>>> Given worker: push and wait for worker up ${currentDir}`);
        await zetaPush(currentDir);
        return {
          ...deps
        };
      }
      return {
        runner: undefined,
        ...deps
      };
    } catch (e) {
      givenLogger.error(`>>> Given worker: FAILED ${currentDir}`, e);
      throw e;
    }
  }
}
