// Hot Module Replacement
require('hot-module-replacement')({
  // regexp to decide if module should be ignored; also can be a function accepting string and returning true/false
  ignore: /node_modules/,
  ignore: /application.json/
});
// Core
const EventEmitter = require('events');
// Packages
const cwd = require('resolve-cwd');
const fs = require('fs');
const path = require('path');
const { trace, warn } = require('@zetapush/common');

const events = new EventEmitter();

const dispatch = (worker) => events.emit('reload', worker);

let last = Date.now();

/**
 * @param {Object} command
 */
const load = (command) => {
  // Check front config
  checkFrontDirectoryExists(command.name(), command.front, command.serveFront);
  checkFrontDirHasHtmlFile(command.name(), command.front, command.serveFront);

  // Check worker config
  checkPackageJsonContainsMainProperty(path.resolve(process.cwd(), 'package.json'));
  checkMainPropertyOfPackageJsonIsCorrect(path.resolve(process.cwd(), 'package.json'));

  try {
    const id = cwd(command.worker);
    let worker = require(id);
    if (module.hot) {
      module.hot.accept(id, (filepath) => {
        // Ensure clear cache
        delete require.cache[require.resolve(filepath)];
        // Reload worker declaration
        worker = require(filepath);
        // Time tracking
        const now = Date.now();
        if (now - last > 5000) {
          // Dispatch event outside event loop
          dispatch(worker);
          // Update latest update
          last = now;
        }
      });
    }
    return worker;
  } catch (e) {
    trace('Failed to load worker code', e);
    throw e;
    // throw new WorkerLoadError('Failed to load worker code', e);
  }
};

/**
 * Check if the front directory exists
 * @param {string} nameCommand Name of the command 'run' or 'push'
 * @param {string} frontDir Directory name of the front
 * @param {boolean | undefined} serveFront Serve front flag is activated or not
 */
const checkFrontDirectoryExists = (nameCommand, frontDir, serveFront) => {
  if (!fs.existsSync(frontDir) && ((nameCommand === 'run' && serveFront) || nameCommand === 'push')) {
    throw {
      code: 'DIR_FRONT_MISSING',
      message: `The directory ${frontDir} doesn't exists. It is configured to store your front`
    };
  }
};

/**
 * Check if the front directory has html page
 * @param {string} nameCommand Name of the command 'run' or 'push'
 * @param {string} frontDir Directory name of the front
 * @param {boolean | undefined} serveFront Serve front flag is activated or not
 */
const checkFrontDirHasHtmlFile = (nameCommand, frontDir, serveFront) => {
  if ((nameCommand === 'run' && serveFront) || nameCommand === 'push') {
    const listFiles = fs.readdirSync(frontDir);
    if (!listFiles.some((elt) => elt.endsWith('.html') || elt.endsWith('.htm'))) {
      warn(`The front folder doesn't contains any html file.`);
    }
  }
};

/**
 * Check if the package.json file has a "main" property
 * @param {string} pathPackageJson Path of the package.json
 */
const checkPackageJsonContainsMainProperty = (pathPackageJson) => {
  const propertyMain = JSON.parse(fs.readFileSync(pathPackageJson)).main;
  if (!propertyMain) {
    throw {
      code: 'MAIN_PROPERTY_MISSING',
      message: `The main property is missing in your package.json file`
    };
  }
};

/**
 * Check if the "main" property of the package.json is correct (if the file exists)
 * @param {string} pathPackageJson Path of the package.json
 */
const checkMainPropertyOfPackageJsonIsCorrect = (pathPackageJson) => {
  const propertyMain = JSON.parse(fs.readFileSync(pathPackageJson)).main;
  if (!fs.existsSync(path.resolve(propertyMain))) {
    throw {
      code: 'WRONG_MAIN_PROPERTY',
      message: 'The main property has a wrong value'
    };
  }
};

class WorkerLoadError extends Error {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
  }
}

module.exports = { load, events, WorkerLoadError };
