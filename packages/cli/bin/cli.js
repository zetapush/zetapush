#!/usr/bin/env node

const { _ } = require('minimist')(process.argv.slice(2));

const run = require('./commands/run');
const bootstrap = require('./utils/bootstrap');

const path = _.length === 1 ? `./${_[0]}` : '.';

bootstrap(path).then(({ zetapush, Api }) => run(Api, zetapush));
