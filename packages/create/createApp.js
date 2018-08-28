'use strict';

const os = require('os');
const path = require('path');
const execSync = require('child_process').execSync;

const chalk = require('chalk');
const commander = require('commander');
const spawn = require('cross-spawn');
const fs = require('fs-extra');

const { createAccount, DEFAULTS, getDeveloperLogin, getDeveloperPassword, logger } = require('@zetapush/cli');

logger.setVerbosity(1);

function increaseVerbosity(v, total) {
  logger.setVerbosity(total);
  return total + 1;
}

const pkg = require('./package.json');

// These files should be allowed to remain on a failed install,
// but then silently removed during the next create.
const errorLogFilePatterns = ['npm-debug.log', 'yarn-error.log', 'yarn-debug.log'];

const program = new commander.Command(pkg.name)
  .version(pkg.version)
  .option('-u, --platform-url <platform-url>', 'Platform URL', DEFAULTS.PLATFORM_URL)
  .option('-l, --developer-login <developer-login>', 'Developer login')
  .option('-p, --developer-password <developer-password>', 'Developer password')
  .option('-a, --app-name <app-name>', 'Application name')
  .option(
    '-f, --force-current-version',
    'Use the same version as built version for the generated project',
    () => true,
    false
  )
  .option(
    '-v, --verbose',
    'Verbosity level (-v=error+warn+info, -vv=error+warn+info+log, -vvv=error+warn+info+log+trace)',
    increaseVerbosity,
    1
  )
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action((name, command) => {
    const version = getCurrentVersion(command);
    const config = validateOptions(command);
    createAccount(config)
      .then((zetarc) => {
        createApp(name, zetarc, version, command);
      })
      .catch((failure) => {
        logger.error('createAccount', failure);
      });
  })
  .on('--help', () => {})
  .parse(process.argv);

function getCurrentVersion(command) {
  if (!command.forceCurrentVersion) {
    return null;
  }
  const version = JSON.parse(fs.readFileSync(__dirname + '/package.json')).version;
  logger.trace(`using current version (${version})`);
  return version;
}

function validateOptions({ appName, developerLogin, developerPassword, platformUrl }) {
  // Prompt mandatory values
  if (!developerLogin) {
    developerLogin = getDeveloperLogin();
  }
  if (!developerPassword) {
    developerPassword = getDeveloperPassword();
  }
  const missing = [];
  if (!developerLogin) {
    missing.push('--developer-login');
  }
  if (!developerPassword) {
    missing.push('--developer-password');
  }
  if (missing.length > 0) {
    console.log();
    console.log('Aborting init.');
    console.log(chalk.red(`Missing mandatory option(s): ${missing.join(', ')}`));
    console.log();
    process.exit(1);
  }
  return { appName, developerLogin, developerPassword, platformUrl };
}

function createApp(name, zetarc, version, command) {
  const root = path.resolve(name);
  const appName = path.basename(root);

  fs.ensureDirSync(name);
  if (!isSafeToCreateProjectIn(root, name)) {
    process.exit(1);
  }

  console.log(`Creating a new ZetaPush app in ${chalk.green(root)}.`);
  console.log();

  const packageJson = {
    name: appName,
    version: '0.1.0',
    main: `worker/index.ts`,
    private: true,
    scripts: {
      deploy: 'zeta push',
      start: 'zeta run',
      troubleshoot: 'zeta troubleshoot'
    },
    dependencies: {}
  };
  // Create package.json
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2) + os.EOL);
  // Create .zetarc
  fs.writeFileSync(path.join(root, '.zetarc'), JSON.stringify(zetarc, null, 2) + os.EOL);

  const originalDirectory = process.cwd();
  process.chdir(root);

  run(root, appName, originalDirectory, version, command);
}

// If project only contains files generated by GH, it’s safe.
// Also, if project contains remnant error logs from a previous
// installation, lets remove them now.
// We also special case IJ-based products .idea because it integrates with CRA:
// https://github.com/facebook/create-react-app/pull/368#issuecomment-243446094
function isSafeToCreateProjectIn(root, name) {
  const validFiles = [
    '.DS_Store',
    'Thumbs.db',
    '.git',
    '.gitignore',
    '.idea',
    'README.md',
    'LICENSE',
    'web.iml',
    '.hg',
    '.hgignore',
    '.hgcheck',
    '.npmignore',
    'mkdocs.yml',
    'docs',
    '.travis.yml',
    '.gitlab-ci.yml',
    '.gitattributes'
  ];
  console.log();

  const conflicts = fs
    .readdirSync(root)
    .filter((file) => !validFiles.includes(file))
    // Don't treat log files from previous installation as conflicts
    .filter((file) => !errorLogFilePatterns.some((pattern) => file.indexOf(pattern) === 0));

  if (conflicts.length > 0) {
    console.log(`The directory ${chalk.green(name)} contains files that could conflict:`);
    console.log();
    for (const file of conflicts) {
      console.log(`  ${file}`);
    }
    console.log();
    console.log('Either try using a new directory name, or remove the files listed above.');

    return false;
  }

  // Remove any remnant files from a previous installation
  const currentFiles = fs.readdirSync(path.join(root));
  currentFiles.forEach((file) => {
    errorLogFilePatterns.forEach((errorLogFilePattern) => {
      // This will catch `(npm-debug|yarn-error|yarn-debug).log*` files
      if (file.indexOf(errorLogFilePattern) === 0) {
        fs.removeSync(path.join(root, file));
      }
    });
  });
  return true;
}

function init(appPath, appName, originalDirectory, command) {
  const language = 'typescript';
  // Copy the files for the user
  const templatePath = path.join(__dirname, 'template', language);
  if (fs.existsSync(templatePath)) {
    fs.copySync(templatePath, appPath);
  } else {
    console.error(`Could not locate supplied template: ${chalk.green(templatePath)}`);
    return;
  }

  // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
  // See: https://github.com/npm/npm/issues/1862
  try {
    fs.moveSync(path.join(appPath, 'gitignore'), path.join(appPath, '.gitignore'), []);
  } catch (err) {
    // Append if there's already a `.gitignore` file there
    if (err.code === 'EEXIST') {
      const data = fs.readFileSync(path.join(appPath, 'gitignore'));
      fs.appendFileSync(path.join(appPath, '.gitignore'), data);
      fs.unlinkSync(path.join(appPath, 'gitignore'));
    } else {
      throw err;
    }
  }

  if (tryGitInit(appPath)) {
    console.log();
    console.log('Initialized a git repository.');
  }

  // Display the most elegant way to cd.
  // This needs to handle an undefined originalDirectory for
  // backward compatibility with old global-cli's.
  let cdpath;
  if (originalDirectory && path.join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }

  console.log();
  console.log(`Success! Created ${appName} at ${appPath}`);
  console.log('Inside that directory, you can run several commands:');
  console.log();
  console.log(chalk.cyan(`  npm run start`));
  console.log('    Starts the development server.');
  console.log();
  console.log(chalk.cyan(`  npm run deploy`));
  console.log('    Deploy your application on ZetaPush platform.');
  console.log();
  console.log('We suggest that you begin by typing:');
  console.log();
  console.log(chalk.cyan('  cd'), cdpath);
  console.log(`  ${chalk.cyan(`npm run start`)}`);
  console.log();
  console.log('Enjoy, Celtia is on your back !');
}

function run(root, appName, originalDirectory, version, command) {
  const versionStr = version ? '@' + version : '';
  const dependencies = [
    `@zetapush/core${versionStr}`,
    `@zetapush/cli${versionStr}`,
    `@zetapush/platform-legacy${versionStr}`,
    `typescript@latest`
  ];

  console.log('Installing packages. This might take a couple of minutes.');
  console.log(`Installing ${dependencies.map((dependency) => `${chalk.cyan(dependency)}`).join(', ')}.`);
  console.log();

  return install(dependencies)
    .then(() => init(root, appName, originalDirectory, command))
    .catch((reason) => {
      console.log();
      console.log('Aborting installation.');
      if (reason.command) {
        console.log(`  ${chalk.cyan(reason.command)} has failed.`);
      } else {
        console.log(chalk.red('Unexpected error. Please report it as a bug:'));
        console.log(reason);
      }
      console.log();

      // On 'exit' we will delete these files from target directory.
      const knownGeneratedFiles = ['package.json', 'node_modules'];
      const currentFiles = fs.readdirSync(path.join(root));
      currentFiles.forEach((file) => {
        knownGeneratedFiles.forEach((fileToMatch) => {
          // This remove all of knownGeneratedFiles.
          if (file === fileToMatch) {
            console.log(`Deleting generated file... ${chalk.cyan(file)}`);
            fs.removeSync(path.join(root, file));
          }
        });
      });
      const remainingFiles = fs.readdirSync(path.join(root));
      if (!remainingFiles.length) {
        // Delete target folder if empty
        console.log(`Deleting ${chalk.cyan(`${appName}/`)} from ${chalk.cyan(path.resolve(root, '..'))}`);
        process.chdir(path.resolve(root, '..'));
        fs.removeSync(path.join(root));
      }
      console.log('Done.');
      process.exit(1);
    });
}

function install(dependencies) {
  return new Promise((resolve, reject) => {
    const command = 'npm';
    const args = ['install', '--save', '--save-exact', '--loglevel', 'error'].concat(dependencies);

    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`
        });
        return;
      }
      resolve();
    });
  });
}

function tryGitInit(appPath) {
  let didInit = false;
  try {
    execSync('git --version', { stdio: 'ignore' });
    if (isInGitRepository() || isInMercurialRepository()) {
      return false;
    }

    execSync('git init', { stdio: 'ignore' });
    didInit = true;

    execSync('git add -A', { stdio: 'ignore' });
    execSync('git commit -m "Initial commit from Create React App"', {
      stdio: 'ignore'
    });
    return true;
  } catch (e) {
    if (didInit) {
      // If we successfully initialized but couldn't commit,
      // maybe the commit author config is not set.
      // In the future, we might supply our own committer
      // like Ember CLI does, but for now, let's just
      // remove the Git files to avoid a half-done state.
      try {
        // unlinkSync() doesn't work on directories.
        fs.removeSync(path.join(appPath, '.git'));
      } catch (removeErr) {
        // Ignore.
      }
    }
    return false;
  }
}
