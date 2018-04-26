<p align="center">
  <a href="https://zetapush.com/">
    <img alt="zetapush" src="https://zetapush.com/assets/img/zt_logo@2x.png" width="500">
  </a>
</p>

<p align="center">
  The next generation <strong>backend-as-a-service</strong>
</p>

[![NPM version][npm-version-image]][npm-url]
[![Build Status][build-status-image]][build-status-url]

# ZetaPush JavaScript SDK

> This project is a monorep containing all source of @zetapush/* ecosytem

## Install

From yarn

```console
yarn add @zetapush/{core,platform}
```

From npm

```console
npm install @zetapush/{core,platform} --save
```

```js
import { WeakClient, Authentication } from '@zetapush/core'
import { Stack } from '@zetapush/platform'
```

## Usage

```js
// Create new ZetaPush Client
const client = new WeakClient({
  sandboxId: '<YOUR-SANDBOX-ID>'
})
// Create a Stack service
const service = client.createService({
  Type: Stack,
  listener: {
    list(message) {
      console.log('list callback', message)
    }
  }
})
// Connect client to ZetaPush BaaS
client.connect().then(() => {
  // Call service methods
  service.list({
    stack: '<YOUR-STACK-ID>'
  })
})
```

## Any questions?

* [Frequently Asked Questions](./docs/faq.md)
* :warning: ZetaPush v1.x users? Please check [Migration Guide](./docs/migration.md)

[npm-version-image]: http://img.shields.io/npm/v/@zetapush/core.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@zetapush/core

[build-status-image]: http://img.shields.io/travis/zetapush/zetapush.svg?style=flat-square
[build-status-url]: http://travis-ci.org/zetapush/zetapush
