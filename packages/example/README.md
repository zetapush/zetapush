# ZetaPush Celtia Example

## Installation

```console
npm install
```

## Register

Register an anonymous account on ZetaPush platform

> Create a .zetarc file which contains developer credentials

```console
npm run register
```

## Deployment

Push your code on ZetaPush platform

```console
npm run deploy
```

## Development

Run your code on your local platform

```console
npm run start
```

## Project structure

```console
.
└──
  ├── public
  │  ├── index.html
  │  └── index.js
  ├── server
  │  └── index.js (api implementation)
  └── package.json
```

## How it works?

> Server side

Your server api in a plain old class defining your interface.

Example:

```js
module.exports = class Api {
  async hello() {
    return `Hello World from JavaScript ${Date.now()}`;
  }
}
```

This code expose an API called **hello** which returns a string "Hello World from JavaScript" concatened with server timestamp.

You can use injected platform services with to following.

> Dependency injection use [injection-js](https://github.com/mgechev/injection-js)

```js
const { Inject, Stack } = require('@zetapush/platform');

module.exports = class Api {
  static get parameters() {
    return [
      new Inject(Stack)
    ];
  }
  constructor(stack) {
    this.stack = stack;
  }
  async push(item) {
    return this.stack.push({ stack: 'list', data: item });
  }
}
```

To consume an API in your front-end application you have to create a **mapped** method.

> Client side

#### Register your API mapping class

```js
const api = client.createProxyTaskService();
```

#### Invoke your remote API method

```js
const message = await api.hello();
```
