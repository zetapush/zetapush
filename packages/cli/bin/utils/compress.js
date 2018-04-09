const zip = require('zip-dir');

const compress = (folder, options = {}) =>
  new Promise((resolve, reject) => {
    zip(folder, options, (failure, buffer) => {
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

module.exports = compress;
