import { PathLike, existsSync, readdirSync, lstatSync } from 'fs';
import { trace } from '@zetapush/core';

const zip = require('zip-dir');

export const compress = (folder: PathLike, options = {}) =>
  new Promise((resolve, reject) => {
    if (!existsSync(folder) || !isDirectory(folder) || isEmpty(folder)) {
      trace('not a directory or directory is empty => skip zip');
      return resolve({ folder, options, buffer: null });
    }
    zip(folder, options, (failure: any, buffer: string | Buffer) => {
      if (failure) {
        return reject(failure);
      }
      resolve({
        folder,
        options,
        buffer,
      });
    });
  });

const isDirectory = (folder: PathLike) => {
  return lstatSync(folder).isDirectory();
};

const isEmpty = (folder: PathLike) => {
  var files = readdirSync(folder);
  return files.length === 0;
};
