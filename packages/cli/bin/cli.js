#!/usr/bin/env node

const program = require("commander");

const { version } = require("../package.json");

const push = require("./commands/push");
const run = require("./commands/run");
const bootstrap = require("./utils/bootstrap");

program
  .version(version)
  .option("-a, --api-url <api-url>", "Api url")
  .option("-l, --login <login>", "Account login")
  .option("-p, --password <password>", "Account password")
  .option("-s, --sandbox-id <sandbox-id>", "Sandbox id");

program
  .command("run")
  .arguments("<type> [path]")
  .description("Run your code")
  .action((type = "worker", path = ".", command) =>
    bootstrap(path, command).then(({ Api, zetapush }) =>
      run(type, path, zetapush, Api)
    )
  );

program
  .command("push")
  .arguments("[path]")
  .description("Push your application on ZetaPush platform")
  .action((path, command) =>
    bootstrap(path, command).then(({ Api, zetapush }) =>
      push(path, zetapush, Api)
    )
  );

program
  .command("register")
  .description("Register your account")
  .action(command => console.log("[WIP] zeta register", commande));

program.parse(process.argv);
