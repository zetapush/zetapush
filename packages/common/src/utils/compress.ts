const { existsSync, readdirSync, lstatSync, statSync } = require('fs');
const path = require('path');
const zip = require('zip-dir');

import { trace } from './log';

export const compress = (folder: any, options = {}) =>
  new Promise((resolve, reject) => {
    if (!existsSync(folder) || !isDirectory(folder) || isEmpty(folder)) {
      trace('not a directory or directory is empty => skip zip');
      return resolve({ folder, options, buffer: null });
    }
    zip(folder, options, (failure: any, buffer: any) => {
      if (failure) {
        return reject(failure);
      }

      const workersNumber = readdirSync(path.join(folder, 'workers')).filter((f: any) =>
        statSync(path.join(path.join(folder, 'workers'), f)).isDirectory()
      ).length;

      resolve({
        folder,
        options,
        buffer,
        workersNumber
      });
    });
  });

const isDirectory = (folder: string) => {
  return lstatSync(folder).isDirectory();
};

const isEmpty = (folder: string) => {
  var files = readdirSync(folder);
  return files.length === 0;
};
