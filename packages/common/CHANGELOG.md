# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.35.2"></a>
## [0.35.2](https://github.com/zetapush/zetapush/compare/v0.35.1...v0.35.2) (2018-10-17)




**Note:** Version bump only for package @zetapush/common

<a name="0.35.1"></a>
## [0.35.1](https://github.com/zetapush/zetapush/compare/v0.35.0...v0.35.1) (2018-10-16)




**Note:** Version bump only for package @zetapush/common

<a name="0.35.0"></a>
# [0.35.0](https://github.com/zetapush/zetapush/compare/v0.34.2...v0.35.0) (2018-10-12)


### Bug Fixes

* **ci:** Use npm ci on Jenkins so we must restore package-lock.json ([b17d550](https://github.com/zetapush/zetapush/commit/b17d550))
* **tests:** fix developer password in tests since use of secret token ([1ab8644](https://github.com/zetapush/zetapush/commit/1ab8644))


### Features

* **forbidden-verbs-all:** forbidden all verbs for platforme service ([4cd36fe](https://github.com/zetapush/zetapush/commit/4cd36fe))




<a name="0.34.2"></a>
## [0.34.2](https://github.com/zetapush/zetapush/compare/v0.34.1...v0.34.2) (2018-09-25)




**Note:** Version bump only for package @zetapush/common

<a name="0.34.1"></a>
## [0.34.1](https://github.com/zetapush/zetapush/compare/v0.34.0...v0.34.1) (2018-09-24)




**Note:** Version bump only for package @zetapush/common

<a name="0.34.0"></a>
# [0.34.0](https://github.com/zetapush/zetapush/compare/v0.33.4...v0.34.0) (2018-09-21)


### Features

* **deployment-feedback:** Display in terminal feedback about deployed urls ([1afa7e5](https://github.com/zetapush/zetapush/commit/1afa7e5))




# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.33.4](https://github.com/zetapush/zetapush/compare/v0.33.3...v0.33.4) (2018-09-17)




**Note:** Version bump only for package @zetapush/common

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.33.3](https://github.com/zetapush/zetapush/compare/v0.33.2...v0.33.3) (2018-09-17)




**Note:** Version bump only for package @zetapush/common

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.33.2](https://github.com/zetapush/zetapush/compare/v0.33.1...v0.33.2) (2018-09-13)




**Note:** Version bump only for package @zetapush/common

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.33.1](https://github.com/zetapush/zetapush/compare/v0.33.0...v0.33.1) (2018-09-12)




**Note:** Version bump only for package @zetapush/common

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.33.0](https://github.com/zetapush/zetapush/compare/v0.32.1...v0.33.0) (2018-09-12)


### Bug Fixes

* **timeoutify:** fix timeoutify implementation ([00acad2](https://github.com/zetapush/zetapush/commit/00acad2))


### Features

* **common-circular-dependency:** remove circular dependencies on common package ([34fce29](https://github.com/zetapush/zetapush/commit/34fce29))
* **package-version-coherence:** update package version coherence ([504cc20](https://github.com/zetapush/zetapush/commit/504cc20))
* **worker-namespace:** update example to support requestContext member ([2215703](https://github.com/zetapush/zetapush/commit/2215703))
* **worker-namespace:** update worker namespace implementation ([3deb6db](https://github.com/zetapush/zetapush/commit/3deb6db)), closes [#165](https://github.com/zetapush/zetapush/issues/165)


### BREAKING CHANGES

* **worker-namespace:** Namespace must be specified on TaskService creation




# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.32.1](https://github.com/zetapush/zetapush/compare/v0.32.0...v0.32.1) (2018-09-07)




**Note:** Version bump only for package @zetapush/common

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.32.0](https://github.com/zetapush/zetapush/compare/v0.31.4...v0.32.0) (2018-09-04)


### Bug Fixes

* **di:** fix dependency injection after merge ([4c830bb](https://github.com/zetapush/zetapush/commit/4c830bb))
* **di:** fix di issue in tests after merge ([3050800](https://github.com/zetapush/zetapush/commit/3050800))
* **testing:** provisionning of platform services wasn't effective ([304df48](https://github.com/zetapush/zetapush/commit/304df48))
* **typo:** rename environement to environment ([cbdaacc](https://github.com/zetapush/zetapush/commit/cbdaacc))


### Features

* **configurer:** configurers now returns providers ([859527d](https://github.com/zetapush/zetapush/commit/859527d))
* **externalize-metadata:** move metadata from platform package to core ([67a75fe](https://github.com/zetapush/zetapush/commit/67a75fe))
* **externalize-metadata:** move metadata from platform package to core ([33217bb](https://github.com/zetapush/zetapush/commit/33217bb))
* **new-di-algorythm:** add imported providers to priorized providers list ([ce6a8d7](https://github.com/zetapush/zetapush/commit/ce6a8d7))
* **new-di-algorythm:** improve comments and lisibility ([e2c5917](https://github.com/zetapush/zetapush/commit/e2c5917))
* **new-di-algorythm:** remove legacy DI system ([82177a3](https://github.com/zetapush/zetapush/commit/82177a3))
* **new-di-algorythm:** support environment interface ([4f03ecb](https://github.com/zetapush/zetapush/commit/4f03ecb))
* **new-di-algorythm:** support imported providers via imports ([c2ed6a9](https://github.com/zetapush/zetapush/commit/c2ed6a9))
* **new-di-algorythm:** update DI Sytem with module based approach ([0ac75fd](https://github.com/zetapush/zetapush/commit/0ac75fd))
* **properties:** load configuration properties ([0b4b6d0](https://github.com/zetapush/zetapush/commit/0b4b6d0))
* **rename-platform-package:** rename platform package to platform-legacy ([9dfcef9](https://github.com/zetapush/zetapush/commit/9dfcef9)), closes [#114](https://github.com/zetapush/zetapush/issues/114)
* **rename-platform-package:** rename platform package to platform-legacy ([e913921](https://github.com/zetapush/zetapush/commit/e913921)), closes [#114](https://github.com/zetapush/zetapush/issues/114)
* **rollup:** bump rollup version ([b841f1e](https://github.com/zetapush/zetapush/commit/b841f1e))
* preprare configurable api ([67770b4](https://github.com/zetapush/zetapush/commit/67770b4))
* preprare configurable api ([20d5923](https://github.com/zetapush/zetapush/commit/20d5923))


### BREAKING CHANGES

* **new-di-algorythm:** Disable JavaScript support
* **rename-platform-package:** @zetapush/platform is no longer available use @zetapush/platform-legacy
* **externalize-metadata:** Context and injection-js related class and interfaces are now available in core package
* **rename-platform-package:** @zetapush/platform is no longer available use @zetapush/platform-legacy
* **externalize-metadata:** Context and injection-js related class and interfaces are now available in core package




# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.30.1](https://github.com/zetapush/zetapush/compare/v0.30.0...v0.30.1) (2018-07-18)




**Note:** Version bump only for package @zetapush/common

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.30.0](https://github.com/zetapush/zetapush/compare/v0.29.0...v0.30.0) (2018-07-13)


### Code Refactoring

* add an empty core package to avoid confusion with previous named package ([e7f2a4f](https://github.com/zetapush/zetapush/commit/e7f2a4f))


### Features

* rename [@zetapush](https://github.com/zetapush)/core to [@zetapush](https://github.com/zetapush)/client ([74f5151](https://github.com/zetapush/zetapush/commit/74f5151)), closes [#79](https://github.com/zetapush/zetapush/issues/79)


### BREAKING CHANGES

* @zetapush/common is now an empty package
* Rename @zetapush/common to @zetapush/client
