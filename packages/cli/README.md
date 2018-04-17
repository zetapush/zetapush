# Getting started CLI

## Init

### Precisions

The CLI is working progress, mainly the command `zeta new` :

Currently, the installation of dependencies is mocked because the npm packages are not the good ones. To check this, see `installDependencies()` in `init.js` file.

### How to use it

The main command to launch an init is :

```console
$ zeta new myApp
```

With `myApp` the name of your app.

To use a specific ZetaPush you use :

```console
$ zeta new myApp --login user@zetapush.com
```

In this case, a prompt will invite you type your password

To create a project, only to use the existing Cloud Services, you type :

```console
$ zeta new myApp --front-only
```