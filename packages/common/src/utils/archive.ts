const path = require('path');
const fs = require('fs');
const os = require('os');
const fsExtra = require('fs-extra');
const zip = require('folder-zip-sync');

import { filter, BLACKLIST } from './upload';
import { mkdir } from './files';
import { generateProvisioningFile } from '../worker/provisioning';
import { compress } from './compress';
import { readConfigFromPackageJson } from './config';
import { info } from './log';

/**
 * Generate an archive (.zip file) used by upload process
 * @param {Object} command
 * @param {Object} config
 * @param {WorkerDeclaration} declaration
 */
export const archive = (command: any, config: any, declaration: any, type: string) => {
  const ts = Date.now();
  const root = path.join(os.tmpdir(), String(ts));
  const app = path.join(root, 'app');
  const rootArchive = `${root}.zip`;
  const pathWorkers = path.join(root, 'workers');
  const artefactsConfig = readConfigFromPackageJson();
  const options = {
    filter: filter(BLACKLIST)
  };

  return mkdir(root)
    .then(() => createWorkersFolder(command, pathWorkers, artefactsConfig.workers))
    .then(() => createFrontsFolder(command, root, artefactsConfig.fronts))
    .then(() => generateProvisioningFile(app, config, declaration, type))
    .then(() => compress(root, { ...options, ...{ saveTo: rootArchive } }))
    .then(() => rootArchive);
};

/**
 * Create the folder workers/ that contains all workers we need
 * @param {*} workers
 * @param {*} target
 */
export const createWorkersFolder = (command: any, target: string, artefactsWorker: any) => {
  new Promise((resolve, reject) => {
    // Create directory of the target
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target);
    }

    // Case --workers is specified
    if (command.workers) {
      const usedWorkers = command.workers.split(',');
      if (artefactsWorker) {
        // Search path of workers in the artefacts config
        usedWorkers.forEach((worker: any) => {
          copyWorkerFolderInsideArchive(worker, artefactsWorker, target);
        });
        resolve(usedWorkers);
      } else {
        reject('The configuration of your worker locations is missing. Check your package.json file.');
      }
    }
    // Case --worker is specified or no configuration is specified
    else if (command.worker) {
      const usedWorker = command.worker;

      // Basic case without configuration
      if (fs.existsSync(path.join(process.cwd(), usedWorker))) {
        fs.mkdirSync(path.join(target, usedWorker));
        try {
          fsExtra.copySync(path.resolve(path.join(process.cwd(), usedWorker)), path.join(target, usedWorker), {
            filter: filter(BLACKLIST)
          });
          resolve(usedWorker);
        } catch (err) {
          reject(`Failed to load worker folder (default case)`);
        }
      } else if (artefactsWorker) {
        copyWorkerFolderInsideArchive(usedWorker, artefactsWorker, target);
        resolve(usedWorker);
      } else {
        reject('The configuration of your worker location is missing. Check your package.json file.');
      }
    }
  });
};

/**
 * Create the folder fronts/ that contains all fronts we need
 * @param {*} command
 * @param {*} target
 * @param {*} artefactsFront
 */
const createFrontsFolder = (command: any, target: string, artefactsFront: any) => {
  return new Promise((resolve, reject) => {
    // Create directory of the target
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target);
    }

    // Case --fronts is specified
    if (command.fronts) {
      const usedFronts = command.fronts.split(',');
      if (artefactsFront) {
        // Search path of fronts in the artefacts config
        usedFronts.forEach((front: any) => {
          copyFrontFolderInsideArchive(front, artefactsFront, target);
        });
        resolve(usedFronts);
      } else {
        reject('The configuration of your front locations is missing. Check your package.json file.');
      }
    }
    // Case --front is specified or no configuration is specified
    else if (command.front) {
      const usedFront = command.front;

      // Basic case without configuration
      if (fs.existsSync(path.join(process.cwd(), usedFront))) {
        fs.mkdirSync(path.join(target, usedFront));
        try {
          zip(path.resolve(path.join(process.cwd(), usedFront)), path.resolve(path.join(target, `${usedFront}.zip`)));
          resolve(usedFront);
        } catch (err) {
          reject(`Failed to load front folder (default case)`);
        }
      } else if (artefactsFront) {
        copyFrontFolderInsideArchive(usedFront, artefactsFront, target);
        resolve(usedFront);
      } else {
        reject('The configuration of your front location is missing. Check your package.json file.');
      }
    }
  });
};

const copyFrontFolderInsideArchive = (frontName: string, artefactsFront: any, target: string) => {
  fs.mkdirSync(path.join(target, frontName));
  if (artefactsFront[frontName]) {
    zip(path.resolve(artefactsFront[frontName]), path.resolve(path.join(target, `${frontName}.zip`)));
  } else {
    info(`The front named '${frontName}' is not configured in the package.json file.`);
  }
};

const copyWorkerFolderInsideArchive = (workerName: string, artefactsWorker: any, target: string) => {
  fs.mkdirSync(path.join(target, workerName));
  if (artefactsWorker[workerName]) {
    fsExtra.copySync(path.resolve(artefactsWorker[workerName]), path.join(target, workerName), {
      filter: filter(BLACKLIST)
    });
  } else {
    info(`The worker named '${workerName}' is not configured in the package.json file.`);
  }
};
