# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.13.3"></a>
## [0.13.3](https://github.com/zetapush/zetapush/compare/v0.13.2...v0.13.3) (2018-05-29)


### Bug Fixes

* **di:** fix di issue for non exposed Api ([da9e756](https://github.com/zetapush/zetapush/commit/da9e756))




<a name="0.13.2"></a>
## [0.13.2](https://github.com/zetapush/zetapush/compare/v0.13.1...v0.13.2) (2018-05-28)


### Bug Fixes

* **cli/run:** update provisioning mechanism ([ee2b332](https://github.com/zetapush/zetapush/commit/ee2b332))




<a name="0.13.1"></a>
## [0.13.1](https://github.com/zetapush/zetapush/compare/v0.13.0...v0.13.1) (2018-05-28)


### Features

* **provisionning:** update provisioning with new DI mechanism ([cf7b60c](https://github.com/zetapush/zetapush/commit/cf7b60c))




<a name="0.13.0"></a>
# [0.13.0](https://github.com/zetapush/zetapush/compare/v0.12.0...v0.13.0) (2018-05-28)


### Bug Fixes

* **cometd:** remove mutation of Transport class properties ([93a29ce](https://github.com/zetapush/zetapush/commit/93a29ce))
* **di:** rename Injectable decorator to Exposed ([3a6733f](https://github.com/zetapush/zetapush/commit/3a6733f))


### Features

* **custom-cloud-services:** update di mechanism with injection-js ([55532b6](https://github.com/zetapush/zetapush/commit/55532b6))
* **custom-cloud-services:** update exposed CustomCloudService declaration ([b0c3072](https://github.com/zetapush/zetapush/commit/b0c3072))




<a name="0.12.0"></a>
# [0.12.0](https://github.com/zetapush/zetapush/compare/v0.11.1...v0.12.0) (2018-05-24)


### Features

* **auto-register:** support auto-register for push and run command ([fcf09e4](https://github.com/zetapush/zetapush/commit/fcf09e4))




<a name="0.11.1"></a>
## [0.11.1](https://github.com/zetapush/zetapush/compare/v0.11.0...v0.11.1) (2018-05-23)


### Features

* **cli:** improve error message ([564d02c](https://github.com/zetapush/zetapush/commit/564d02c))




<a name="0.11.0"></a>
# [0.11.0](https://github.com/zetapush/zetapush/compare/v0.10.2...v0.11.0) (2018-05-22)


### Bug Fixes

* **server:** add clearInterval for synchronous server methods ([8ab1d17](https://github.com/zetapush/zetapush/commit/8ab1d17))


### Features

* **cli-register:** add push and run options ([97d4c16](https://github.com/zetapush/zetapush/commit/97d4c16))
* **cli-register:** implements register command, rename args ([c970c59](https://github.com/zetapush/zetapush/commit/c970c59))
* **cli/push:** support allready deploying error code for push command ([85de8ee](https://github.com/zetapush/zetapush/commit/85de8ee))
* **cli/run:** add run <type> argument to future proof ([0c01096](https://github.com/zetapush/zetapush/commit/0c01096))
* **cli/run:** add workerServiceId config entry ([e8ca007](https://github.com/zetapush/zetapush/commit/e8ca007))
* **server:** improve error management ([bd01a40](https://github.com/zetapush/zetapush/commit/bd01a40))


### BREAKING CHANGES

* **cli-register:** Rename top level options




<a name="0.10.2"></a>
## [0.10.2](https://github.com/zetapush/zetapush/compare/v0.10.1...v0.10.2) (2018-04-23)


### Bug Fixes

* **cli/push:** add .git to ignored filepath pattern ([4cf7da6](https://github.com/zetapush/zetapush/commit/4cf7da6))




<a name="0.10.1"></a>
## [0.10.1](https://github.com/zetapush/zetapush/compare/v0.10.0...v0.10.1) (2018-04-23)




**Note:** Version bump only for package zetapush

<a name="0.10.0"></a>
# [0.10.0](https://github.com/zetapush/zetapush/compare/v0.9.1...v0.10.0) (2018-04-23)


### Features

* **server/context:** add a new 2nd parameters (injected by worker) to give some information about r ([cac1d0b](https://github.com/zetapush/zetapush/commit/cac1d0b))




<a name="0.9.1"></a>
## [0.9.1](https://github.com/zetapush/zetapush/compare/v0.9.0...v0.9.1) (2018-04-23)


### Bug Fixes

* **client:** update dynamic method invocation variable name ([7e37442](https://github.com/zetapush/zetapush/commit/7e37442))




<a name="0.9.0"></a>
# [0.9.0](https://github.com/zetapush/zetapush/compare/v0.8.5...v0.9.0) (2018-04-23)


### Bug Fixes

* **cli/push:** return to percentage based progression ([d74ed5f](https://github.com/zetapush/zetapush/commit/d74ed5f))


### Features

* **client:** add new createProxyTaskService method to support proxified task service ([b11bf20](https://github.com/zetapush/zetapush/commit/b11bf20))




<a name="0.8.5"></a>
## [0.8.5](https://github.com/zetapush/zetapush/compare/v0.8.4...v0.8.5) (2018-04-23)


### Bug Fixes

* **cli/push:** update progression with internal delat value ([131a83e](https://github.com/zetapush/zetapush/commit/131a83e))




<a name="0.8.4"></a>
## [0.8.4](https://github.com/zetapush/zetapush/compare/v0.8.3...v0.8.4) (2018-04-12)


### Bug Fixes

* **cli/push:** update progress to a valid ratio ([de007eb](https://github.com/zetapush/zetapush/commit/de007eb))




<a name="0.8.3"></a>
## [0.8.3](https://github.com/zetapush/zetapush/compare/v0.8.2...v0.8.3) (2018-04-12)


### Bug Fixes

* **cli/push:** update progress update ([3dd6d52](https://github.com/zetapush/zetapush/commit/3dd6d52))




<a name="0.8.2"></a>
## [0.8.2](https://github.com/zetapush/zetapush/compare/v0.8.1...v0.8.2) (2018-04-11)


### Bug Fixes

* **cli/run:** support nullable injected Api properties ([01114f5](https://github.com/zetapush/zetapush/commit/01114f5))




<a name="0.8.1"></a>
## [0.8.1](https://github.com/zetapush/zetapush/compare/v0.8.0...v0.8.1) (2018-04-11)


### Bug Fixes

* **cli/di:** fix DI error on empty cases ([61f7d98](https://github.com/zetapush/zetapush/commit/61f7d98))




<a name="0.8.0"></a>
# [0.8.0](https://github.com/zetapush/zetapush/compare/v0.7.0...v0.8.0) (2018-04-11)


### Features

* **cli-push:** improve auto provisionning ([222a9d9](https://github.com/zetapush/zetapush/commit/222a9d9))




<a name="0.7.0"></a>
# [0.7.0](https://github.com/zetapush/zetapush/compare/v0.6.0...v0.7.0) (2018-04-11)


### Features

* **cli-push:** show push progression ([a33a326](https://github.com/zetapush/zetapush/commit/a33a326)), closes [#9](https://github.com/zetapush/zetapush/issues/9)
* **cli-push:** update bootstrap and push ([f1b8840](https://github.com/zetapush/zetapush/commit/f1b8840))
* **provisioning:** support autoprovisioning from injected platform services ([5a3ca92](https://github.com/zetapush/zetapush/commit/5a3ca92)), closes [#7](https://github.com/zetapush/zetapush/issues/7)




<a name="0.6.0"></a>
# [0.6.0](https://github.com/zetapush/zetapush/compare/v0.5.0...v0.6.0) (2018-04-09)


### Features

* **cli:** add basic progress on push command ([65b193c](https://github.com/zetapush/zetapush/commit/65b193c))
* **cli:** add cli push command ([0ed7a55](https://github.com/zetapush/zetapush/commit/0ed7a55))
* **cli-push:** improve developer feedback ([9389244](https://github.com/zetapush/zetapush/commit/9389244))
* **cli-push:** manage invalid status code for progress poll ([fcfdba8](https://github.com/zetapush/zetapush/commit/fcfdba8))
* **cli-push:** support error case when recipeId not returned by push method ([0ebb01b](https://github.com/zetapush/zetapush/commit/0ebb01b))
* **typings:** update typings definition ([add97fd](https://github.com/zetapush/zetapush/commit/add97fd))




<a name="0.5.0"></a>
# [0.5.0](https://github.com/zetapush/zetapush/compare/v0.4.0...v0.5.0) (2018-03-20)


### Features

* **async-connection:** support promise based method for connect() and disconnect() methods ([951a3af](https://github.com/zetapush/zetapush/commit/951a3af)), closes [#1](https://github.com/zetapush/zetapush/issues/1)
* **client:** add createProxy(Macro)Service to create generic service ([c0e2b13](https://github.com/zetapush/zetapush/commit/c0e2b13)), closes [#2](https://github.com/zetapush/zetapush/issues/2)
* **cometd:** replace websocket implementation from websocket to ws ([c7af6a9](https://github.com/zetapush/zetapush/commit/c7af6a9))
* **sandbox-alias:** add support for sandbox alias ([d2aa381](https://github.com/zetapush/zetapush/commit/d2aa381))




<a name="0.4.0"></a>
# [0.4.0](https://github.com/zetapush/zetapush/compare/v0.3.1...v0.4.0) (2018-02-20)


### Bug Fixes

* **platform:** update HttpClient service name ([a3433e4](https://github.com/zetapush/zetapush/commit/a3433e4))
* **server:** expose ApiMethodTimeout decorator ([abc55bd](https://github.com/zetapush/zetapush/commit/abc55bd))


### Features

* **server:** add decorator for api methode timeout ([7eb5bcc](https://github.com/zetapush/zetapush/commit/7eb5bcc))




<a name="0.3.1"></a>
## [0.3.1](https://github.com/zetapush/zetapush/compare/v0.3.0...v0.3.1) (2018-02-20)




**Note:** Version bump only for package zetapush

<a name="0.3.0"></a>
# [0.3.0](https://github.com/zetapush/zetapush/compare/v0.2.2...v0.3.0) (2018-02-20)


### Features

* **server:** add timeout for api method ([7f3473e](https://github.com/zetapush/zetapush/commit/7f3473e))




<a name="0.2.2"></a>
## [0.2.2](https://github.com/zetapush/zetapush/compare/v0.2.1...v0.2.2) (2018-02-20)




**Note:** Version bump only for package zetapush

<a name="0.2.1"></a>
## [0.2.1](https://github.com/zetapush/zetapush/compare/v0.2.0...v0.2.1) (2018-02-20)


### Bug Fixes

* **cometd:** add previsouly ignored files ([49f6288](https://github.com/zetapush/zetapush/commit/49f6288))




<a name="0.2.0"></a>
# 0.2.0 (2018-02-20)


### Features

* **build:** split packages concern ([378207c](https://github.com/zetapush/zetapush/commit/378207c))
* **server:** expose metadata for decorators ([1ba3a93](https://github.com/zetapush/zetapush/commit/1ba3a93))
* **server:** initial support for api decorator ([b1030d3](https://github.com/zetapush/zetapush/commit/b1030d3))
