const path = require('path');
const fs = require('fs');
const os = require('os');

const mkdirs = (file) => {
  let dirs = [];
  for (let dir of path.parse(file).dir.split(path.sep)) {
    dirs.push(dir);
    let dirPath = dirs.join(path.sep);
    if (dirPath) {
      fs.existsSync(dirPath) || fs.mkdirSync(dirPath);
    }
  }
};

const getZetaFilePath = (...relativePath) => {
  const p = path.normalize(
    path.resolve(os.homedir(), '.zeta', ...relativePath),
  );
  mkdirs(p);
  return p;
};

module.exports = { mkdirs, getZetaFilePath };
