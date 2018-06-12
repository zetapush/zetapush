const { WeakClient } = require('@zetapush/core');
const transports = require('@zetapush/cometd/lib/node/Transports');
const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const PATTERN = /Hello World from JavaScript (\d+)/

readFile('./hello/.zetarc', { encoding: 'utf-8' })
  .then((text) => JSON.parse(text))
  .then((config) => ({
    ...config,
    transports
  }))
  .then((config) => new WeakClient(config))
  .then((client) => new Promise((resolve, reject) => {
    client.connect()
    .then(() => resolve(client), reject)
  }))
  .then((client) => client.createProxyTaskService().hello())
  .then((message) => PATTERN.test(message))
  .then((success) => console.log('[SUCCESS]', success))
  .catch(() => console.error('[SUCCESS]', false))
  .then(() => process.exit(0))