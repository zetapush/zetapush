# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="1.0.0"></a>
# [1.0.0](https://github.com/zetapush/zetapush/compare/v0.38.0...v1.0.0) (2019-01-09)




**Note:** Version bump only for package zetapush

<a name="0.38.0"></a>
# [0.38.0](https://github.com/zetapush/zetapush/compare/v0.37.7...v0.38.0) (2019-01-09)


### Bug Fixes

* **createServices:** increase the timeout of the createServices call ([b27a263](https://github.com/zetapush/zetapush/commit/b27a263))
* **StandardUserWorkflow:** fix email templating for reset password ([943dc30](https://github.com/zetapush/zetapush/commit/943dc30))
* **testing:** Make node-ipc dependency only available in tests ([e03d704](https://github.com/zetapush/zetapush/commit/e03d704))
* **testing:** testing tools were not adapted for our clients ([7425e0e](https://github.com/zetapush/zetapush/commit/7425e0e))
* **user-management:** improve relative URL management and add error messages ([b32b643](https://github.com/zetapush/zetapush/commit/b32b643))


### BREAKING CHANGES

* **user-management:** 'registration.confirmation.base-url' and 'reset-password.ask.base-url' have been removed. Please use
'registration.confirmation.confirm-url' and 'registration.confirmation.confirm-url' instead




<a name="0.37.7"></a>
## [0.37.7](https://github.com/zetapush/zetapush/compare/v0.37.6...v0.37.7) (2018-12-21)




**Note:** Version bump only for package zetapush

<a name="0.37.6"></a>
## [0.37.6](https://github.com/zetapush/zetapush/compare/v0.37.1...v0.37.6) (2018-12-21)


### Bug Fixes

* **client:** add unimplemented method setResource on ClientHelper ([30f5fd5](https://github.com/zetapush/zetapush/commit/30f5fd5))
* **email+password loss:** fix confirmation email content and fix password loss type ([2a52ea6](https://github.com/zetapush/zetapush/commit/2a52ea6))
* **user-management:** fix configurer override ([c61eb1b](https://github.com/zetapush/zetapush/commit/c61eb1b))
* **Worker:** fix auto register after platform reboot ([ac9b1be](https://github.com/zetapush/zetapush/commit/ac9b1be))


### Features

* **cli:** check synchronisity between package-lock.json and package.json ([18074d9](https://github.com/zetapush/zetapush/commit/18074d9))
* **cli:** disable Cache-Control for served html files ([59e04cb](https://github.com/zetapush/zetapush/commit/59e04cb))
* **cli:** handle promise rejection with a warning message ([b9d79de](https://github.com/zetapush/zetapush/commit/b9d79de))
* **CLI:** add 'config' command to set or get the current config ([7b03885](https://github.com/zetapush/zetapush/commit/7b03885))
* **client:** use dynamic version instead of static version ([53ff4a7](https://github.com/zetapush/zetapush/commit/53ff4a7))
* **context:** allow to configure relative URL to benefit from auto conf ([2420240](https://github.com/zetapush/zetapush/commit/2420240))
* **push:** add troubleshooting section for PACKAGE_LOCK_OUT_OF_SYNC error ([0fbf6ba](https://github.com/zetapush/zetapush/commit/0fbf6ba))
* **stability:** implements auto register after server reboot ([a636af7](https://github.com/zetapush/zetapush/commit/a636af7))
* **worker:** update resource before each register ([66606ed](https://github.com/zetapush/zetapush/commit/66606ed))




<a name="0.37.5"></a>
## [0.37.5](https://github.com/zetapush/zetapush/compare/v0.37.1...v0.37.5) (2018-12-21)


### Bug Fixes

* **client:** add unimplemented method setResource on ClientHelper ([30f5fd5](https://github.com/zetapush/zetapush/commit/30f5fd5))
* **email+password loss:** fix confirmation email content and fix password loss type ([2a52ea6](https://github.com/zetapush/zetapush/commit/2a52ea6))
* **user-management:** fix configurer override ([c61eb1b](https://github.com/zetapush/zetapush/commit/c61eb1b))
* **Worker:** fix auto register after platform reboot ([ac9b1be](https://github.com/zetapush/zetapush/commit/ac9b1be))


### Features

* **cli:** check synchronisity between package-lock.json and package.json ([18074d9](https://github.com/zetapush/zetapush/commit/18074d9))
* **cli:** disable Cache-Control for served html files ([59e04cb](https://github.com/zetapush/zetapush/commit/59e04cb))
* **cli:** handle promise rejection with a warning message ([b9d79de](https://github.com/zetapush/zetapush/commit/b9d79de))
* **CLI:** add 'config' command to set or get the current config ([7b03885](https://github.com/zetapush/zetapush/commit/7b03885))
* **client:** use dynamic version instead of static version ([53ff4a7](https://github.com/zetapush/zetapush/commit/53ff4a7))
* **context:** allow to configure relative URL to benefit from auto conf ([2420240](https://github.com/zetapush/zetapush/commit/2420240))
* **push:** add troubleshooting section for PACKAGE_LOCK_OUT_OF_SYNC error ([0fbf6ba](https://github.com/zetapush/zetapush/commit/0fbf6ba))
* **stability:** implements auto register after server reboot ([a636af7](https://github.com/zetapush/zetapush/commit/a636af7))
* **worker:** update resource before each register ([66606ed](https://github.com/zetapush/zetapush/commit/66606ed))




<a name="0.37.4"></a>
## [0.37.4](https://github.com/zetapush/zetapush/compare/v0.37.3...v0.37.4) (2018-12-18)


### Bug Fixes

* **client:** add unimplemented method setResource on ClientHelper ([30f5fd5](https://github.com/zetapush/zetapush/commit/30f5fd5))
* **email+password loss:** fix confirmation email content and fix password loss type ([2a52ea6](https://github.com/zetapush/zetapush/commit/2a52ea6))




<a name="0.37.3"></a>
## [0.37.3](https://github.com/zetapush/zetapush/compare/v0.37.2...v0.37.3) (2018-12-18)


### Features

* **cli:** disable Cache-Control for served html files ([59e04cb](https://github.com/zetapush/zetapush/commit/59e04cb))
* **CLI:** add 'config' command to set or get the current config ([7b03885](https://github.com/zetapush/zetapush/commit/7b03885))
* **context:** allow to configure relative URL to benefit from auto conf ([2420240](https://github.com/zetapush/zetapush/commit/2420240))
* **worker:** update resource before each register ([66606ed](https://github.com/zetapush/zetapush/commit/66606ed))




<a name="0.37.2"></a>
## [0.37.2](https://github.com/zetapush/zetapush/compare/v0.37.1...v0.37.2) (2018-12-14)


### Features

* **client:** use dynamic version instead of static version ([53ff4a7](https://github.com/zetapush/zetapush/commit/53ff4a7))




<a name="0.37.1"></a>
## [0.37.1](https://github.com/zetapush/zetapush/compare/v0.37.0...v0.37.1) (2018-11-29)


### Bug Fixes

* **StandardUserWorkflow:** expose API LostPassword ([9dec01a](https://github.com/zetapush/zetapush/commit/9dec01a))




<a name="0.37.0"></a>
# [0.37.0](https://github.com/zetapush/zetapush/compare/v0.35.5...v0.37.0) (2018-11-29)


### Bug Fixes

* **cli:** update zetarc validation process ([1494b49](https://github.com/zetapush/zetapush/commit/1494b49))
* **client:** remove queued subscriptions listeners on connection broken ([a1b9cbb](https://github.com/zetapush/zetapush/commit/a1b9cbb))
* **http:** differentiate custom http server url from zetapush http server url ([6138269](https://github.com/zetapush/zetapush/commit/6138269))
* **http:** remove [@zetapush](https://github.com/zetapush) prefix ([0f15923](https://github.com/zetapush/zetapush/commit/0f15923))
* **http:** remove [@zetapush](https://github.com/zetapush) prefix ([7876656](https://github.com/zetapush/zetapush/commit/7876656))
* **Integration:** add typescript and ts-node dependencies ([9ea927b](https://github.com/zetapush/zetapush/commit/9ea927b))
* **Livereload:** avoid error when update "application.json" file (livereload issue) ([b6dc96d](https://github.com/zetapush/zetapush/commit/b6dc96d)), closes [#219](https://github.com/zetapush/zetapush/issues/219)
* **log:** purge process output stream before spinner stop ([69a3fa0](https://github.com/zetapush/zetapush/commit/69a3fa0)), closes [#151](https://github.com/zetapush/zetapush/issues/151)
* **Troubleshooting:** add correct error message for bad .zetarc file format (JSON) ([6ed4788](https://github.com/zetapush/zetapush/commit/6ed4788))
* **Troubleshooting:** fix troubleshooting displayer ([c0d4850](https://github.com/zetapush/zetapush/commit/c0d4850))
* **typings:** support new ProxyTaskService definition ([c9a6202](https://github.com/zetapush/zetapush/commit/c9a6202))


### Features

* **cli:** handle missing mandatory arguments ([f554f1c](https://github.com/zetapush/zetapush/commit/f554f1c))
* **config:** clean defaults properties from serialization process ([5eacc77](https://github.com/zetapush/zetapush/commit/5eacc77))
* **reset-password:** separate senders between confirmation and reset password ([0aff35a](https://github.com/zetapush/zetapush/commit/0aff35a))
* **Troubleshooting:** add error management for worker configuration ([690719a](https://github.com/zetapush/zetapush/commit/690719a))
* **Troubleshooting:** add troubleshooting when front folder missing ([106c62d](https://github.com/zetapush/zetapush/commit/106c62d))




<a name="0.36.0"></a>
# [0.36.0](https://github.com/zetapush/zetapush/compare/v0.35.5...v0.36.0) (2018-11-29)


### Bug Fixes

* **cli:** update zetarc validation process ([1494b49](https://github.com/zetapush/zetapush/commit/1494b49))
* **client:** remove queued subscriptions listeners on connection broken ([a1b9cbb](https://github.com/zetapush/zetapush/commit/a1b9cbb))
* **http:** differentiate custom http server url from zetapush http server url ([6138269](https://github.com/zetapush/zetapush/commit/6138269))
* **http:** remove [@zetapush](https://github.com/zetapush) prefix ([0f15923](https://github.com/zetapush/zetapush/commit/0f15923))
* **http:** remove [@zetapush](https://github.com/zetapush) prefix ([7876656](https://github.com/zetapush/zetapush/commit/7876656))
* **Integration:** add typescript and ts-node dependencies ([9ea927b](https://github.com/zetapush/zetapush/commit/9ea927b))
* **Livereload:** avoid error when update "application.json" file (livereload issue) ([b6dc96d](https://github.com/zetapush/zetapush/commit/b6dc96d)), closes [#219](https://github.com/zetapush/zetapush/issues/219)
* **log:** purge process output stream before spinner stop ([69a3fa0](https://github.com/zetapush/zetapush/commit/69a3fa0)), closes [#151](https://github.com/zetapush/zetapush/issues/151)
* **Troubleshooting:** add correct error message for bad .zetarc file format (JSON) ([6ed4788](https://github.com/zetapush/zetapush/commit/6ed4788))
* **Troubleshooting:** fix troubleshooting displayer ([c0d4850](https://github.com/zetapush/zetapush/commit/c0d4850))
* **typings:** support new ProxyTaskService definition ([c9a6202](https://github.com/zetapush/zetapush/commit/c9a6202))


### Features

* **cli:** handle missing mandatory arguments ([f554f1c](https://github.com/zetapush/zetapush/commit/f554f1c))
* **config:** clean defaults properties from serialization process ([5eacc77](https://github.com/zetapush/zetapush/commit/5eacc77))
* **reset-password:** separate senders between confirmation and reset password ([0aff35a](https://github.com/zetapush/zetapush/commit/0aff35a))
* **Troubleshooting:** add error management for worker configuration ([690719a](https://github.com/zetapush/zetapush/commit/690719a))
* **Troubleshooting:** add troubleshooting when front folder missing ([106c62d](https://github.com/zetapush/zetapush/commit/106c62d))




<a name="0.35.5"></a>
## [0.35.5](https://github.com/zetapush/zetapush/compare/v0.35.4...v0.35.5) (2018-10-30)




**Note:** Version bump only for package zetapush

<a name="0.35.4"></a>
## [0.35.4](https://github.com/zetapush/zetapush/compare/v0.35.3...v0.35.4) (2018-10-30)




**Note:** Version bump only for package zetapush

<a name="0.35.3"></a>
## [0.35.3](https://github.com/zetapush/zetapush/compare/v0.35.2...v0.35.3) (2018-10-30)




**Note:** Version bump only for package zetapush

<a name="0.35.2"></a>
## [0.35.2](https://github.com/zetapush/zetapush/compare/v0.35.1...v0.35.2) (2018-10-17)




**Note:** Version bump only for package zetapush

<a name="0.35.1"></a>
## [0.35.1](https://github.com/zetapush/zetapush/compare/v0.35.0...v0.35.1) (2018-10-16)




**Note:** Version bump only for package zetapush

<a name="0.35.0"></a>
# [0.35.0](https://github.com/zetapush/zetapush/compare/v0.34.2...v0.35.0) (2018-10-12)


### Bug Fixes

* **api:** Do not transform API return values ([4d5d49b](https://github.com/zetapush/zetapush/commit/4d5d49b))
* **ci:** npm ci can't be used with node 8 / npm 5 ([76ba834](https://github.com/zetapush/zetapush/commit/76ba834))
* **ci:** Use npm ci on Jenkins so we must restore package-lock.json ([b17d550](https://github.com/zetapush/zetapush/commit/b17d550))
* **loader-config:** add missing getDeveloperLogin import ([fd04bbb](https://github.com/zetapush/zetapush/commit/fd04bbb))
* **smart-client-persistence:** update appName on persistence data level ([d78fef3](https://github.com/zetapush/zetapush/commit/d78fef3)), closes [#199](https://github.com/zetapush/zetapush/issues/199)
* **tests:** fix developer password in tests since use of secret token ([1ab8644](https://github.com/zetapush/zetapush/commit/1ab8644))


### Features

* **example:** update created example ([cd3d499](https://github.com/zetapush/zetapush/commit/cd3d499))
* **forbidden-verbs-all:** forbidden all verbs for platforme service ([4cd36fe](https://github.com/zetapush/zetapush/commit/4cd36fe))
* **lerna:** update lerna config ([3bc4b30](https://github.com/zetapush/zetapush/commit/3bc4b30))
* **security:** no longer display developer password in zetarc file ([f576249](https://github.com/zetapush/zetapush/commit/f576249))


### BREAKING CHANGES

* **api:** A client that calls an API method returning null or undefined value will no longer
receive an empty object

182




<a name="0.34.2"></a>
## [0.34.2](https://github.com/zetapush/zetapush/compare/v0.34.1...v0.34.2) (2018-09-25)




**Note:** Version bump only for package zetapush

<a name="0.34.1"></a>
## [0.34.1](https://github.com/zetapush/zetapush/compare/v0.34.0...v0.34.1) (2018-09-24)


### Features

* **replace-progression-implementation:** add log to give a feedback on bundling phase ([f329928](https://github.com/zetapush/zetapush/commit/f329928))
* **replace-progression-implementation:** replace node-progress-bars by log-update ([e578fea](https://github.com/zetapush/zetapush/commit/e578fea))
* **ush-progress-color:** update push progress color to support errors ([a8ff07a](https://github.com/zetapush/zetapush/commit/a8ff07a))




<a name="0.34.0"></a>
# [0.34.0](https://github.com/zetapush/zetapush/compare/v0.33.4...v0.34.0) (2018-09-21)


### Features

* **add-grab-all-traffic-cli-option:** add troubleshooting information on worker register fail ([5969aec](https://github.com/zetapush/zetapush/commit/5969aec))
* **add-grab-all-traffic-cli-option:** change grapAll to grabAll ([aa09e49](https://github.com/zetapush/zetapush/commit/aa09e49))
* **add-grab-all-traffic-cli-option:** support grabAllTraffic option ([cfe2a19](https://github.com/zetapush/zetapush/commit/cfe2a19))
* **connection:** Add reason of failed connection ([606771a](https://github.com/zetapush/zetapush/commit/606771a))
* **deployment-feedback:** Display in terminal feedback about deployed urls ([1afa7e5](https://github.com/zetapush/zetapush/commit/1afa7e5))
* **update-default-worker-name:** Update default worker name from worker to Queue.DEFAULT_DEPLOYMENT ([df3c13e](https://github.com/zetapush/zetapush/commit/df3c13e))
* **update-prompt-implementation:** replace prompt-sync by prompts ([a275e0a](https://github.com/zetapush/zetapush/commit/a275e0a)), closes [#100](https://github.com/zetapush/zetapush/issues/100)


### Reverts

* **lerna:** downgrade to lerna@2 ([2b49067](https://github.com/zetapush/zetapush/commit/2b49067)), closes [#194](https://github.com/zetapush/zetapush/issues/194)




<a name="0.24.1"></a>
## [0.24.1](https://github.com/zetapush/zetapush/compare/v0.24.0...v0.24.1) (2018-06-18)


### Features

* **integration:** add wip jasmine test ([c1891d7](https://github.com/zetapush/zetapush/commit/c1891d7))




<a name="0.24.0"></a>
# [0.24.0](https://github.com/zetapush/zetapush/compare/v0.23.2...v0.24.0) (2018-06-17)


### Features

* **run-http-server:** support cli option flag ([09003a0](https://github.com/zetapush/zetapush/commit/09003a0))
* **run-http-server:** support experimental http with config injection ([72152d7](https://github.com/zetapush/zetapush/commit/72152d7))
* **run-http-server:** use variable free http port ([4e6177c](https://github.com/zetapush/zetapush/commit/4e6177c))




<a name="0.23.2"></a>
## [0.23.2](https://github.com/zetapush/zetapush/compare/v0.23.1...v0.23.2) (2018-06-15)


### Features

* **cli/run:** add Weak auth as default provisionning bootstrap service ([ff95db5](https://github.com/zetapush/zetapush/commit/ff95db5))




<a name="0.23.1"></a>
## [0.23.1](https://github.com/zetapush/zetapush/compare/v0.23.0...v0.23.1) (2018-06-15)


### Features

* **provisionning:** remove Weak as default deployment service ([a82cdb0](https://github.com/zetapush/zetapush/commit/a82cdb0))




<a name="0.23.0"></a>
# [0.23.0](https://github.com/zetapush/zetapush/compare/v0.22.2...v0.23.0) (2018-06-15)


### Features

* **integration-jasmine:** add jasmine for integration tests ([2c72efb](https://github.com/zetapush/zetapush/commit/2c72efb))



<a name="0.21.2"></a>
## [0.21.2](https://github.com/zetapush/zetapush/compare/v0.21.1...v0.21.2) (2018-06-13)


### Features

* **custom-front-worker-path:** implement --front and --worker options ([f540e30](https://github.com/zetapush/zetapush/commit/f540e30))




<a name="0.22.0"></a>
# [0.22.0](https://github.com/zetapush/zetapush/compare/v0.22.2...v0.22.0) (2018-06-15)


### Features

* **integration-jasmine:** add jasmine for integration tests ([2c72efb](https://github.com/zetapush/zetapush/commit/2c72efb))



<a name="0.21.2"></a>
## [0.21.2](https://github.com/zetapush/zetapush/compare/v0.21.1...v0.21.2) (2018-06-13)


### Features

* **custom-front-worker-path:** implement --front and --worker options ([f540e30](https://github.com/zetapush/zetapush/commit/f540e30))




<a name="0.21.2"></a>
## [0.21.2](https://github.com/zetapush/zetapush/compare/v0.21.1...v0.21.2) (2018-06-13)


### Features

* **custom-front-worker-path:** implement --front and --worker options ([f540e30](https://github.com/zetapush/zetapush/commit/f540e30))




<a name="0.21.1"></a>
## [0.21.1](https://github.com/zetapush/zetapush/compare/v0.21.0...v0.21.1) (2018-06-13)


### Features

* **defaults:** update default platformUrl for create package ([3d5fe41](https://github.com/zetapush/zetapush/commit/3d5fe41))




<a name="0.21.0"></a>
# [0.21.0](https://github.com/zetapush/zetapush/compare/v0.20.1...v0.21.0) (2018-06-13)


### Bug Fixes

* **integration:** support test npm@5 and npm@6 ([52cd149](https://github.com/zetapush/zetapush/commit/52cd149))
* **integration:** update project name in test file ([f57b7cb](https://github.com/zetapush/zetapush/commit/f57b7cb))


### Features

* **cli/run errors:** add error handling for 'zeta run' ([a44aa09](https://github.com/zetapush/zetapush/commit/a44aa09))
* **defaults:** update default platformUrl value to https://celtia-alpha.zpush.io/ ([cc746f2](https://github.com/zetapush/zetapush/commit/cc746f2))
* **test:** add integration package ([d12170e](https://github.com/zetapush/zetapush/commit/d12170e))




<a name="0.20.1"></a>
## [0.20.1](https://github.com/zetapush/zetapush/compare/v0.20.0...v0.20.1) (2018-06-11)




**Note:** Version bump only for package zetapush

<a name="0.20.0"></a>
# [0.20.0](https://github.com/zetapush/zetapush/compare/v0.19.0...v0.20.0) (2018-06-11)


### Features

* **cli/create:** add troubleshoot command to create package.json ([9acbc9d](https://github.com/zetapush/zetapush/commit/9acbc9d))
* **create-app:** improve error catching ([31857e9](https://github.com/zetapush/zetapush/commit/31857e9))




<a name="0.19.0"></a>
# [0.19.0](https://github.com/zetapush/zetapush/compare/v0.18.4...v0.19.0) (2018-06-07)


### Bug Fixes

* **create-account:** whitelist options from process.argv ([4be42c0](https://github.com/zetapush/zetapush/commit/4be42c0))


### Features

* **create-account:** create account on init step ([b631c21](https://github.com/zetapush/zetapush/commit/b631c21))
* **worker:** expose worker capacity ([72a0a3e](https://github.com/zetapush/zetapush/commit/72a0a3e))


### BREAKING CHANGES

* **create-account:** Autoregister is no longer supported




<a name="0.18.4"></a>
## [0.18.4](https://github.com/zetapush/zetapush/compare/v0.18.3...v0.18.4) (2018-06-05)


### Bug Fixes

* **create:** update minimal supported node version ([aec0573](https://github.com/zetapush/zetapush/commit/aec0573))




<a name="0.18.3"></a>
## [0.18.3](https://github.com/zetapush/zetapush/compare/v0.18.2...v0.18.3) (2018-06-05)


### Bug Fixes

* **create:** support correctly semver parsing ([e313320](https://github.com/zetapush/zetapush/commit/e313320))




<a name="0.18.2"></a>
## [0.18.2](https://github.com/zetapush/zetapush/compare/v0.18.1...v0.18.2) (2018-06-05)


### Bug Fixes

* **create:** support correct semver test for node version ([9f7e841](https://github.com/zetapush/zetapush/commit/9f7e841))
* **worker:** support void return for custom cloud service function ([f8ee42b](https://github.com/zetapush/zetapush/commit/f8ee42b))




<a name="0.18.1"></a>
## [0.18.1](https://github.com/zetapush/zetapush/compare/v0.18.0...v0.18.1) (2018-06-05)


### Features

* **CLI/run:** add progress on the 'zeta run' command with info of end ([d4a9935](https://github.com/zetapush/zetapush/commit/d4a9935))




<a name="0.18.0"></a>
# [0.18.0](https://github.com/zetapush/zetapush/compare/v0.17.1...v0.18.0) (2018-06-04)


### Features

* **api:** update top level api with new wording definitions ([7895410](https://github.com/zetapush/zetapush/commit/7895410))


### BREAKING CHANGES

* **api:** Change top level api for client options




<a name="0.17.1"></a>
## [0.17.1](https://github.com/zetapush/zetapush/compare/v0.17.0...v0.17.1) (2018-06-04)


### Bug Fixes

* **create:** support https://github.com/npm/npm/issues/1862 workaround ([20f4b0a](https://github.com/zetapush/zetapush/commit/20f4b0a))




<a name="0.17.0"></a>
# [0.17.0](https://github.com/zetapush/zetapush/compare/v0.16.3...v0.17.0) (2018-06-04)


### Features

* **convention:** rename folders: server --> worker, public --> front ([45a7a63](https://github.com/zetapush/zetapush/commit/45a7a63))




<a name="0.16.3"></a>
## [0.16.3](https://github.com/zetapush/zetapush/compare/v0.16.2...v0.16.3) (2018-06-04)


### Bug Fixes

* **log:** update log level for live status info ([06d7659](https://github.com/zetapush/zetapush/commit/06d7659))




<a name="0.16.2"></a>
## [0.16.2](https://github.com/zetapush/zetapush/compare/v0.16.1...v0.16.2) (2018-06-01)




**Note:** Version bump only for package zetapush

<a name="0.16.1"></a>
## [0.16.1](https://github.com/zetapush/zetapush/compare/v0.16.0...v0.16.1) (2018-06-01)


### Features

* **create:** support template step ([0c026ce](https://github.com/zetapush/zetapush/commit/0c026ce))




<a name="0.16.0"></a>
# [0.16.0](https://github.com/zetapush/zetapush/compare/v0.15.3...v0.16.0) (2018-06-01)


### Bug Fixes

* **create:** update bin path ([9552987](https://github.com/zetapush/zetapush/commit/9552987))


### Features

* **create:** add initial implementation of [@zetapush](https://github.com/zetapush)/create package ([e9f5deb](https://github.com/zetapush/zetapush/commit/e9f5deb))
* **create:** support install step ([45cf9f9](https://github.com/zetapush/zetapush/commit/45cf9f9))




<a name="0.15.3"></a>
## [0.15.3](https://github.com/zetapush/zetapush/compare/v0.15.2...v0.15.3) (2018-05-31)


### Bug Fixes

* **provisioning:** support provisioning for run and push ([e3d367a](https://github.com/zetapush/zetapush/commit/e3d367a))




<a name="0.15.2"></a>
## [0.15.2](https://github.com/zetapush/zetapush/compare/v0.15.1...v0.15.2) (2018-05-31)




**Note:** Version bump only for package zetapush

<a name="0.15.1"></a>
## [0.15.1](https://github.com/zetapush/zetapush/compare/v0.15.0...v0.15.1) (2018-05-31)


### Bug Fixes

* **worker:** allow non promise based public api ([c733867](https://github.com/zetapush/zetapush/commit/c733867))




<a name="0.15.0"></a>
# [0.15.0](https://github.com/zetapush/zetapush/compare/v0.14.4...v0.15.0) (2018-05-31)


### Bug Fixes

* **cli/run:** fix the 'zeta run' in worker context (skip provisioning) ([db61ada](https://github.com/zetapush/zetapush/commit/db61ada))
* **cli/run:** update creation of services for 'zeta run' -> creation with realtime verb ([1343e33](https://github.com/zetapush/zetapush/commit/1343e33))


### Features

* **provisioning:** update workflow for bootstrap provisioning ([d6122e9](https://github.com/zetapush/zetapush/commit/d6122e9))




<a name="0.14.4"></a>
## [0.14.4](https://github.com/zetapush/zetapush/compare/v0.14.3...v0.14.4) (2018-05-30)


### Bug Fixes

* **core:** fix bad reduce prototype ([5a21e48](https://github.com/zetapush/zetapush/commit/5a21e48))




<a name="0.14.3"></a>
## [0.14.3](https://github.com/zetapush/zetapush/compare/v0.14.2...v0.14.3) (2018-05-30)


### Bug Fixes

* **core:** use Object.entries instead of Object.values for clean utility ([96f7a33](https://github.com/zetapush/zetapush/commit/96f7a33))


### Features

* **transport-bootsratp:** implement getOverloadedConfigFromEnvironement for browser and node ([e589c65](https://github.com/zetapush/zetapush/commit/e589c65))




<a name="0.14.2"></a>
## [0.14.2](https://github.com/zetapush/zetapush/compare/v0.14.1...v0.14.2) (2018-05-29)


### Features

* **progression:** update progression with [STAT] prefix ([c5e1baa](https://github.com/zetapush/zetapush/commit/c5e1baa))




<a name="0.14.1"></a>
## [0.14.1](https://github.com/zetapush/zetapush/compare/v0.14.0...v0.14.1) (2018-05-29)


### Features

* **cli/run:** implement 'skip-provisioning' on 'zeta run' ([ecd5ecb](https://github.com/zetapush/zetapush/commit/ecd5ecb))
* **progress:** change display to match specs ([b3caba6](https://github.com/zetapush/zetapush/commit/b3caba6))




<a name="0.14.0"></a>
# [0.14.0](https://github.com/zetapush/zetapush/compare/v0.13.2...v0.14.0) (2018-05-29)


### Bug Fixes

* **di:** fix di issue for non exposed Api ([2f033ea](https://github.com/zetapush/zetapush/commit/2f033ea))
* **worker-resource:** update default worker resource id ([814c93b](https://github.com/zetapush/zetapush/commit/814c93b))


### Features

* **cli/run:** create services before 'zeta run' ([aec6a3b](https://github.com/zetapush/zetapush/commit/aec6a3b))




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
