// Packages
const chalk = require('chalk');
const prompt = require('prompt-sync')();

const getDeveloperPassword = () =>
  prompt({
    ask: chalk`[{green.bold SECURITY}] {bold Developer password ?}:`,
    echo: '*',
  });

module.exports = { getDeveloperPassword };
