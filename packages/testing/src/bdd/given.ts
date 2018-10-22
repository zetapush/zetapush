import { existsSync, write } from 'fs';

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
  npmInstallFromLocal,
  zetaPush,
  ExposedModule,
  OrderedInstallConfiguration
} from '../utils/commands';
import { TestContext, Dependencies, FrontOptions } from '../utils/types';
import { createApplication, DEFAULTS } from '@zetapush/common';
import { InjectionToken, Module } from '@zetapush/core';
const util = require('util');
const findFreePort = util.promisify(require('find-free-port'));
const express = require('express');
const execa = require('execa');
const fs = require('fs');
const archiver = require('archiver');
const spawn = require('child_process').spawn;

import * as path from 'path';

export const given = () => new Given();

class Given {
  private sharedCredentials: Config;
  private givenCredentials?: GivenCredentials;
  private givenApp?: GivenApp;
  private givenWorker?: GivenWorker;
  private givenNpm?: GivenNpm;
  private givenFront?: GivenFront;

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
   * Configure the behavior for the npm dependencies installation
   */
  npm() {
    this.givenNpm = new GivenNpm(this);
    return this.givenNpm;
  }

  /*
   * Configure the behavior of the front.
   */
  front() {
    this.givenFront = new GivenFront(this);
    return this.givenFront;
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
    let confNpmInstall!: OrderedInstallConfiguration;
    try {
      if (this.givenNpm) {
        const { exposedModules, server: localModulesServer } = await this.givenNpm.execute();
        const orderedExposedModules = generateTreeOrderedModules(exposedModules);
        confNpmInstall = {
          modules: orderedExposedModules,
          url: localModulesServer
        };
      }
      givenLogger.debug(`>> Apply Given`);
      if (this.givenCredentials) {
        Object.assign(this.sharedCredentials, await this.givenCredentials.execute());
      }

      let projectDir;
      if (this.givenApp) {
        projectDir = await this.givenApp.execute(confNpmInstall);
      }
      let frontOptions;
      if (this.givenFront) {
        frontOptions = await this.givenFront.execute();
      }
      let runnerAndDeps;
      if (this.givenWorker) {
        runnerAndDeps = await this.givenWorker.execute(projectDir, frontOptions);
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

class GivenNpm extends Parent<Given> {
  private givenNpmDependencies?: GivenNpmDependencies;

  constructor(parent: Given) {
    super(parent);
  }

  dependencies() {
    this.givenNpmDependencies = new GivenNpmDependencies(this);
    return this.givenNpmDependencies;
  }

  async execute(): Promise<any> {
    if (this.givenNpmDependencies) {
      return await this.givenNpmDependencies.execute();
    }
  }
}

export const modules = () => {
  return new GivenMultipleNpmModules();
};

class GivenMultipleNpmModules {
  private multipleModules: Array<GivenNpmModule> = [];
  constructor() {}

  module(moduleName: string) {
    const newNpmModule = new GivenNpmModule(this, moduleName);
    this.multipleModules.push(newNpmModule);
    return newNpmModule;
  }

  apply() {
    return this.multipleModules;
  }
}

class GivenNpmDependencies extends Parent<GivenNpm> {
  private givenNpmModules: Array<GivenNpmModule> = [];

  constructor(parent: GivenNpm) {
    super(parent);
  }

  module(moduleName: string) {
    const newNpmModule = new GivenNpmModule(this, moduleName);
    this.givenNpmModules.push(newNpmModule);
    return newNpmModule;
  }

  modules(multipleNpmModules: Array<GivenNpmModule>) {
    for (const npmModule of multipleNpmModules) {
      this.givenNpmModules.push(npmModule);
    }
    return this;
  }

  async execute(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      // Start a web server to expose local dependencies
      const filesServer = express();
      const pathNpmModules = path.join('/tmp', new Date().getTime().toString());
      filesServer.use(express.static(pathNpmModules));
      const port = await findFreePort(4000);
      filesServer.listen(port);

      // Expose each npm module
      const exposedModules: Array<ExposedModule> = [];
      for (const npmModule of this.givenNpmModules) {
        exposedModules.push(npmModule.execute(pathNpmModules));
      }

      // Create a HTTP tunnel to access the npm registry from outside
      try {
        const localtunnel = spawn(`../testing/node_modules/.bin/lt`, [
          '--port',
          port,
          '--host',
          'http://localtunnel.test.zpush.io:666'
        ]);

        localtunnel.stdout.once('data', async (result: any) => {
          const urlTunnel = result
            .toString()
            .split(' ')
            .pop();

          givenLogger.debug(`>> LocalTunnel is on : ${urlTunnel}`);
          resolve({
            exposedModules,
            server: urlTunnel
          });
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}

class GivenNpmModule extends Parent<GivenNpmDependencies | GivenMultipleNpmModules> {
  private givenModuleSources: GivenModuleSources;
  private moduleName: string;

  constructor(parent: GivenNpmDependencies | GivenMultipleNpmModules, moduleName: string) {
    super(parent);
    this.moduleName = moduleName;

    // By default, the used sources are at the path : '../{nameModule}'
    // Ex: for @zetapush/core we use : '../core'
    const lastPartOfNameModule = moduleName.split('/').pop();
    this.givenModuleSources = new GivenModuleSources(this, `../${lastPartOfNameModule}`);
  }

  useSources(sourcesPath: string) {
    this.givenModuleSources = new GivenModuleSources(this, sourcesPath);
    return this.givenModuleSources;
  }

  execute(pathExposedDirectory: string): ExposedModule {
    if (this.givenModuleSources) {
      const extensionArchive = `.tar.gz`;
      const path = this.givenModuleSources.execute(pathExposedDirectory, this.moduleName, extensionArchive);
      return {
        path: path,
        name: `${this.moduleName}${extensionArchive}`
      };
    } else {
      throw `No sources found for this module : ${this.moduleName}`;
    }
  }
}

class GivenModuleSources extends Parent<GivenNpmModule> {
  private sourcesPath: string;

  constructor(parent: GivenNpmModule, sourcesPath: string) {
    super(parent);
    this.sourcesPath = path.resolve(process.cwd(), sourcesPath);
  }

  execute(pathExposedDirectory: string, moduleName: string, extensionArchive: string) {
    // Create the directory exposed
    execa.shellSync(`mkdir -p ${pathExposedDirectory}`);

    // Create the name package and the parent subdirectory if necessary
    const splitedModule = moduleName.split('/');
    const namePackage = `${splitedModule.slice(-1)[0]}${extensionArchive}`;
    const parentModule = splitedModule.slice(0, splitedModule.length - 1).join('/');
    execa.shellSync(`mkdir -p ${path.join(pathExposedDirectory, parentModule)}`);

    // Create the archive
    const pathArchive = `${path.join(pathExposedDirectory, parentModule, namePackage)}`;
    const output = fs.createWriteStream(pathArchive);
    const archive = archiver('tar', {
      gzip: true,
      gzipOptions: {
        level: 1
      }
    });
    archive.pipe(output);
    archive.directory(this.sourcesPath, moduleName);
    archive.finalize();
    return this.sourcesPath;
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

  async execute(confNpmInstall?: OrderedInstallConfiguration): Promise<string | undefined> {
    try {
      let projectDir;
      if (this.givenNewApp) {
        projectDir = await this.givenNewApp.execute(confNpmInstall);
      }
      if (this.givenTestingApp) {
        projectDir = await this.givenTestingApp.execute(confNpmInstall);
      }
      if (this.givenTemplate) {
        projectDir = await this.givenTemplate.execute(confNpmInstall);
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

  async execute(confNpmInstall?: OrderedInstallConfiguration) {
    // TODO:
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
        this.credentials.platformUrl
      );
      if (this.setNewAppName && this.newAppName) {
        givenLogger.silly(`GivenNewApp:execute -> setAppNameToZetarc(${this.projectDir}, ${this.newAppName})`);
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

  async execute(confNpmInstall?: OrderedInstallConfiguration) {
    try {
      givenLogger.info(`>>> Given testing application: ${this.projectDir}`);

      if (this.projectDirName && this.installLatestDependencies) {
        givenLogger.silly(`GivenTestingApp:execute -> npmInstallLatestVersion(${this.projectDir})`);
        if (confNpmInstall) {
          await npmInstallFromLocal(this.projectDir, confNpmInstall);
        } else {
          await npmInstallLatestVersion(this.projectDir);
        }
      }
      if (this.credentials) {
        givenLogger.silly(
          `GivenTestingApp:execute -> setAccountToZetarc(${this.projectDir}, ${JSON.stringify(this.credentials)})`
        );
        await setAccountToZetarc(this.projectDir, this.credentials.developerLogin, this.credentials.developerPassword);
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

  async execute(confNpmInstall?: OrderedInstallConfiguration) {
    try {
      givenLogger.info(`>>> Given templated application: templates/${this.templateApp}`);

      givenLogger.silly(`GivenTemplatedApp:execute -> rm(${this.projectDir})`);
      await rm(this.projectDir);

      givenLogger.silly(
        `GivenTemplatedApp:execute -> copydir.sync(spec/templates/${this.templateApp}, ${this.projectDir})`
      );
      copydir.sync('spec/templates/' + this.templateApp, this.projectDir);

      // await npmInstallLatestVersion(this.projectDir);
      if (confNpmInstall) {
        await npmInstallFromLocal(this.projectDir, confNpmInstall);
      } else {
        await npmInstall(this.projectDir, '*');
      }

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

  async execute(currentDir?: string, frontOptions?: FrontOptions) {
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
          runner: new Runner(currentDir, this.timeout, frontOptions),
          ...deps
        };
      }
      if (this.workerUp && currentDir) {
        givenLogger.info(`>>> Given worker: run and wait for worker up ${currentDir}`);
        const runner = new Runner(currentDir, this.timeout, frontOptions);
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

class GivenFront extends Parent<Given> {
  private serveFront = false;
  private pushFront = false;

  constructor(parent: Given) {
    super(parent);
  }

  /**
   * Start a local server for serving front static resources
   */
  serve() {
    this.serveFront = true;
    return this;
  }

  /**
   * Start a local server for serving front static resources
   */
  pushed() {
    this.pushFront = true;
    return this;
  }

  async execute(): Promise<FrontOptions> {
    return {
      serveFront: this.serveFront,
      pushFront: this.pushFront
    };
  }
}

/**
 * Order the exposed modules about their dependencies
 * @param modules local modules
 */
function generateTreeOrderedModules(modules: Array<ExposedModule>): Array<ExposedModule> {
  const orderedExposedModules: Array<ExposedModule> = [];

  // Iterate on each module and nested dependencies
  modules.forEach((module) => {
    handleNestedDependencies(module);
  });

  return orderedExposedModules;

  /**
   * Handle nested dependencies
   * @param module Nested dependencies
   */
  function handleNestedDependencies(module: ExposedModule) {
    // Before we check dependencies
    const nestedLocalDependencies: Array<ExposedModule> = [];
    const packageJsonFile = JSON.parse(fs.readFileSync(path.join(module.path, 'package.json')));
    for (let dep in packageJsonFile.dependencies) {
      const localModule = modules.find((elt) => elt.name === dep);
      if (localModule) {
        nestedLocalDependencies.push(localModule);
      }
    }

    // Iterate on sub dependencies
    nestedLocalDependencies.forEach((module) => {
      handleNestedDependencies(module);
    });

    // After handle subdependencies, we push our module
    orderedExposedModules.push(module);
  }
}
