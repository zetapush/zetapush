import * as path from 'path';
import * as fs from 'fs';
import { PathLike } from 'fs';
import * as os from 'os';

export const mkdirs = (file: string) => {
  let dirs = [];
  for (let dir of path.parse(file).dir.split(path.sep)) {
    dirs.push(dir);
    let dirPath = dirs.join(path.sep);
    if (dirPath) {
      fs.existsSync(dirPath) || fs.mkdirSync(dirPath);
    }
  }
};

export const getZetaFilePath = (...relativePath: string[]) => {
  const p = path.normalize(
    path.resolve(os.homedir(), '.zeta', ...relativePath),
  );
  mkdirs(p);
  return p;
};

export const mkdir = (root: PathLike) =>
  new Promise((resolve, reject) => {
    fs.mkdir(root, (failure) => {
      if (failure) {
        return reject(failure);
      }
      resolve(root);
    });
  });
