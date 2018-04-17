const { log, error } = require('../utils/log');
const prompt = require('prompt');
const fs = require('fs');
const cwd = require('resolve-cwd');
const jsonfile = require('jsonfile');
const shell = require('shelljs');

const PROD_MODE = false;
let FRONT_ONLY_MODE = false;
let APP_NAME = null;
let FRONT_DIRECTORY = 'front';
let BACK_DIRECTORY = 'server';
let ROOT_FOLDER = shell.pwd().stdout;

/**
 * Main function to launch the init of the ZetaPush application
 * @param {string} app : Name of the app
 * @param {map} config : Configuration of the initialization
 * @param {object} Api
 */
const init = (app, config = {}, Api) => {
  log(`Execute command <init> ${app}`);

  APP_NAME = app;
  if (config.frontOnly) FRONT_ONLY_MODE = true;

  // Check if a path was specified for the front part
  if (config.front)
    FRONT_DIRECTORY = config.front
      .replace(/\./g, '')
      .replace(/^(\/)/, '')
      .replace(/\/$/, '');

  // Check if a path was specified for the front part
  if (config.back)
    BACK_DIRECTORY = config.back
      .replace(/\./g, '')
      .replace(/^(\/)/, '')
      .replace(/\/$/, '');

  // Get password if there is a ZetaPush account
  if (config.login) {
    prompt.start();
    prompt.message = '';
    prompt.get(
      [
        {
          name: 'password',
          required: true,
          hidden: true,
          replace: '*',
          message: 'Password of your ZetaPush account',
        },
      ],
      function(err, result) {
        // Create the folder of our application
        shell.cd(ROOT_FOLDER);
        fs.mkdirSync(APP_NAME);

        // Create the file .gitignore
        shell.cd(ROOT_FOLDER);
        shell.cd(APP_NAME);
        fs.writeFileSync('.gitignore', '.zetarc\n');

        // Create the file .zetarc
        shell.cd(ROOT_FOLDER);
        shell.cd(APP_NAME);
        fs.writeFileSync(
          '.zetarc',
          `zeta_user = ${config.login} \nzeta_password = ${result.password}`,
        );

        // Create the folder front
        createFrontDirectory(FRONT_DIRECTORY);

        // Create the folder server
        if (!FRONT_ONLY_MODE) createBackDirectory(BACK_DIRECTORY);

        // Create the README.md
        shell.cd(ROOT_FOLDER);
        shell.cd(APP_NAME);
        fs.writeFileSync('README.md', generateReadMe());

        // Create the package.json
        generateJsonPackage(config.login);

        // Install the dependencies of ZetaPush
        installDependencies();

        // Display welcome message
        displayWelcomeMessage();
      },
    );
  } else {
    log('No ZetaPush account exists');

    console.log(`
    ----------------
    TODO: Create an account with the CLI
    ---------------
    `);
  }
};
module.exports = init;

/**
 * Return the example code of the app (HTML part)
 */
function generateHtmlHelloWorldExample() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>ZetaPush example</title>
</head>

<body>
    <h1>Hello World By ZetaPush</h1>
    
    <button id="btnHelloWorld" onclick="sayHelloWorld()">Say Hello world</button>
    
    <!-- Présent seulement si on utilise les Custom Cloud Services -->
    <input id="inputName" placeholder="Name">
    <button id="btnHelloUser">Say Hello to a specific name</button>

    <hr>

    <div id="result"></div>

    <script src="./index.js"></script>
</body>

</html>
  `;
}

/**
 * Return the example code of the app (JS part)
 */
function generateJsHelloWorldExample() {
  return `import { HelloWorldService } from '@zetapush/front';

// Only if we use a custom cloud service
import { HelloWorldCustomService } from '../server/index.js';
const btnSayHelloUser = document.getElementById("btnHelloUser");
const inputName = document.getElementById("inputName");


const btnSayHelloWorld = document.getElementById("btnHelloWorld");
const divResult = document.getElementById("result");

const helloService = new HelloWorldService();

/**
 *  Function called when the user click on the "say hello world" button
 */
async function sayHelloWorld() {
  const resultHello = await helloService.hello();
  divResult.innerHTML += \`<p>\${resultHello.content} at \${resultHello.timestamp}</p>\`
}

/**
 * Function to say Hello to a specific name
 * Only if we use Custom Cloud Service
 */
function sayHelloByName() {
    const result = helloWorldService.helloByName(inputName.value);
    divResultCommands.innerHTML += result;
}
`;
}

/**
 * Return the example of custom cloud service
 */
function generateJsHelloWorldExampleCustomCloudService() {
  return `
export class HelloWorldCustomService {

  /**
   *  Cloud function to say "Hello" to a specific name
   *  This cloud function return promise to be asynchrone
   */
  function helloByName(name) {
      return \`Hello \${name} !\`;
  };
}
`;
}

/**
 * Return the first README.md
 */
function generateReadMe() {
  return `# ZetaPush : Celtia

## Documentation

You can see the documentation at https://console.zetapush.com/documentation

## CLI

With the CLI you can do many, for example you can activate your account or you can push your code on the platform.

### Activate an account
  
\`\`\`console
$ zeta account register
Choose your login : damien
Choose your password : *******
Choose your email : damien@gmail.com
\`\`\` 

### Push the code

\`\`\`console
$ zeta push
\`\`\`
`;
}

/**
 * Generate and return the json package
 */
function generateJsonPackage(user) {
  shell.cd(ROOT_FOLDER);
  shell.cd(APP_NAME);

  const data = {
    name: APP_NAME,
    version: '0.0.1',
    description: 'My wonderful app with ZetaPush Celtia',
    zetapush: {
      front: './front',
    },
    author: user,
  };

  jsonfile.writeFileSync('package.json', data, { spaces: 2, EOL: '\r\n' });
}

/**
 * Install necessary dependencies
 */
function installDependencies() {
  shell.cd(ROOT_FOLDER);
  shell.cd(APP_NAME);

  // Install the dependency of @zetapush/front
  if (PROD_MODE) {
    log(`Install @zetapush/front dependency...`);
    shell.exec('npm install --save @zetapush/front');

    if (!FRONT_ONLY_MODE) {
      log(`Install @zetapush/server dependency...`);
      shell.exec('npm install --save @zetapush/server');
    }
  }
}

/**
 * Display the welcome message in the console
 * @param {*} app
 */
function displayWelcomeMessage() {
  console.log(`
---------------------------------------------
Welcome to ZetaPush !
---------------------------------------------

A new application named ${APP_NAME} was added to your account.
Now you can use the Cloud Services in your application.
You can see the documentation here : https://console.zetapush.com/documentation

To deploy your application you can use the command "zeta push". 
You have already an existing use of Cloud Services in "front/index.js", deploy and test it !
   
  `);
}

/**
 * Create the directory to store the front part
 * @param {string} name : Path
 */
function createFrontDirectory(path) {
  // Move to correct folder
  shell.cd(ROOT_FOLDER);
  shell.cd(APP_NAME);

  // Create the folder front
  shell.mkdir('-p', path);
  shell.cd(path);

  // Create the html file of the hello world example
  fs.writeFileSync('index.html', generateHtmlHelloWorldExample());

  // Create the js file of the hello world example
  fs.writeFileSync('index.js', generateJsHelloWorldExample());
}

/**
 * Create the directory to store the back part
 * @param {string} name : Path
 */
function createBackDirectory(path) {
  // Move to correct folder
  shell.cd(ROOT_FOLDER);
  shell.cd(APP_NAME);

  // Create the folder front
  shell.mkdir('-p', path);
  shell.cd(path);

  fs.writeFileSync('index.js', generateJsHelloWorldExampleCustomCloudService());
}
