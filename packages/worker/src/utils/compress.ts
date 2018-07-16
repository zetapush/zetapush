import { PathLike } from 'fs';

const zip = require('zip-dir');

export const compress = (folder: PathLike, options = {}) =>
  new Promise((resolve, reject) => {
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
