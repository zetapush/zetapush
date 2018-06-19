const execa = require('execa');
const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const getStream = require('get-stream');
const rimraf = require('rimraf');


const rm = (path) => new Promise((resolve, reject) => rimraf(path, (failure) => failure ? reject(failure) : resolve()))

const npmInit = (developerLogin, developerPassword, dir) => {
  if (npmVersion().major < 5) {
    throw new Error("Minimum required npm version is 5.6.0")
  }
  let cmd;
  if (npmVersion().major == 5) {
    cmd = execa('npx', ['@zetapush/create', dir, '--developer-login', developerLogin, '--developer-password', developerPassword], { cwd: '.generated-projects' });
  } else {
    cmd = execa('npm', ['init', '@zetapush', dir, '--developer-login', developerLogin, '--developer-password', developerPassword], { cwd: '.generated-projects' });
  }
  cmd.stdout.pipe(process.stdout);
  cmd.stderr.pipe(process.stdout);
  return cmd;
}

const zetaPush = async (dir) => {
  const cmd = execa('npm', ['run', 'deploy', '--', '-vvv'], { cwd: '.generated-projects/' + dir })

  cmd.stdout.pipe(process.stdout);
  cmd.stderr.pipe(process.stdout);

  return Promise.resolve(getStream(cmd.stderr));
}

const zetaRun = async (dir) => {
  const cmd = execa('npm', ['run', 'start', '--', '-vvv'], { cwd: '.generated-projects/' + dir });

  cmd.stdout.pipe(process.stdout);
  cmd.stderr.pipe(process.stdout);

  return Promise.resolve(getStream(cmd.stderr));
}

const readZetarc = async (dir) => {
  const content = await readFile(`.generated-projects/${dir}/.zetarc`, { encoding: 'utf-8' });
  return JSON.parse(content);
}

const deleteAccountFromZetarc = async (dir) => {
  const content = await readFile(`.generated-projects/${dir}/.zetarc`, { encoding: 'utf-8' });
  let jsonContent = JSON.parse(content);

  delete jsonContent.developerLogin;
  delete jsonContent.developerPassword;

  await writeFile(`.generated-projects/${dir}/.zetarc`, JSON.stringify(jsonContent), { encoding: 'utf-8' });

  return jsonContent;
}

const setAppNameToZetarc = async (dir, appName) => {
  const content = await readFile(`.generated-projects/${dir}/.zetarc`, { encoding: 'utf-8' });
  let jsonContent = JSON.parse(content);
  jsonContent.appName = appName;

  await writeFile(`.generated-projects/${dir}/.zetarc`, JSON.stringify(jsonContent), { encoding: 'utf-8' });

  return jsonContent;
}

const setAccountToZetarc = async (dir, login, password) => {
  const content = await readFile(`.generated-projects/${dir}/.zetarc`, { encoding: 'utf-8' });
  let jsonContent = JSON.parse(content);
  jsonContent.developerLogin = login;
  jsonContent.developerPassword = password;

  await writeFile(`.generated-projects/${dir}/.zetarc`, JSON.stringify(jsonContent), { encoding: 'utf-8' });

  return jsonContent;
}

const npmVersion = () => {
  const { stdout } = execa.sync('npm', ['--version']);
  const [major, minor, patch] = stdout.split('.').map((v) => parseInt(v, 10));
  return { major, minor, patch };
}

module.exports = { rm, npmInit, readZetarc, zetaPush, deleteAccountFromZetarc, zetaRun, setAppNameToZetarc, setAccountToZetarc }
