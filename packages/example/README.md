# ZetaPush V3 Example

## Installation

```console
yarn install
```

## Getting started

```console
yarn start
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

```js
const { Stack } = require('@zetapush/platform')
module.exports = class Api {
  static get injected() {
    return [Stack]
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

#### Define your API mapping class

```js
class Api extends ZetaPushPlatform.Queue {
  hello() {
    return this.$publish('hello');
  }
}
```

#### Register your API mapping class

```js
const api = client.createAsyncTaskService({
  Type: Api,
});
```

#### Invoke your API mapping class

```js
const message = await api.hello();
```
