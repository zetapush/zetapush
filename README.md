<p align="center">
  <a href="https://zetapush.com/">
    <img alt="zetapush" src="https://www.zetapush.com/wp-content/uploads/2018/09/ZPlogo-websafe.png" width="500">
  </a>
</p>

<p align="center">
  The next generation <strong>backend-as-a-service</strong>
</p>

[![NPM version][npm-version-image]][npm-url]
[![Build Status][build-status-image]][build-status-url]

# ZetaPush JavaScript SDK

> This project is a monorep containing all source of @zetapush/* ecosytem

## Installation

npm 6+

```console
npm init @zetapush myproject
cd myproject
```

npm 5.x

```console
npx @zetapush/create myproject
cd myproject
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

## Default project structure

```console
.
└──
  ├── front
  │  ├── index.html
  │  └── index.js
  ├── worker
  │  └── index.ts (api implementation)
  └── package.json
```

## How it works?

> Server side

Your server api in a plain old class defining your interface.

Example:

```js
export default class Api {
  hello() {
    return `Hello World from JavaScript ${Date.now()}`;
  }
}
```

This code expose an API called **hello** which returns a string "Hello World from JavaScript" concatened with server timestamp.

You can use injected platform services with to following.

> Dependency injection use [injection-js](https://github.com/mgechev/injection-js)

```js
import { Injectable } from '@zetapush/core';
import { Stack } from '@zetapush/platform-legacy';

@Injectable()
export default class Api {
  constructor(private stack: Stack) {}
  push(item) {
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

[npm-version-image]: http://img.shields.io/npm/v/@zetapush/client.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@zetapush/client

[build-status-image]: http://img.shields.io/travis/zetapush/zetapush.svg?style=flat-square
[build-status-url]: http://travis-ci.org/zetapush/zetapush
