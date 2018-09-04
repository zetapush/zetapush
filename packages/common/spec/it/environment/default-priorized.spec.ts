import 'jasmine';
import {
  Json5ConfigurationProperties,
  MissingConfigurationProperty,
  ConfigurationFileLoadError,
  ConfigurationStateError,
  defaultConfigurationPropertiesFactory
} from '../../../src';

describe(`default-priorized properties`, () => {
  describe(`with 'env' environment activated`, () => {
    describe(`without override for that environment`, () => {
      beforeEach(async () => {
        this.props = await defaultConfigurationPropertiesFactory(
          'env',
          __dirname + '/internal',
          __dirname + '/external'
        );
      });
      describe(`get()`, () => {
        describe(`on key not overriden by 'prod'`, () => {
          it(`returns value from default`, () => {
            const value = this.props.get('mailjet.apiKeyPublic');
            expect(value).toEqual('public-key-from-default');
          });
        });
        describe(`on key overriden by 'prod'`, () => {
          it(`returns value from default`, () => {
            const value = this.props.get('mailjet.apiKeyPrivate');
            expect(value).toEqual('private-key-from-default');
          });
        });
      });
    });
  });

  describe(`with 'prod' environment activated`, () => {
    describe(`without external override`, () => {
      beforeEach(async () => {
        this.props = await defaultConfigurationPropertiesFactory(
          'prod',
          __dirname + '/internal',
          __dirname + '/invalid-path'
        );
      });

      describe(`get()`, () => {
        describe(`on key not overriden by 'prod'`, () => {
          it(`returns value from default`, () => {
            const value = this.props.get('mailjet.apiKeyPublic');
            expect(value).toEqual('public-key-from-default');
          });
        });

        describe(`on key overriden by 'prod'`, () => {
          it(`returns value from 'prod'`, () => {
            const value = this.props.get('mailjet.apiKeyPrivate');
            expect(value).toEqual('private-key-from-prod');
          });
        });
      });
    });

    describe(`with external override`, () => {
      beforeEach(async () => {
        this.props = await defaultConfigurationPropertiesFactory(
          'prod',
          __dirname + '/internal',
          __dirname + '/external'
        );
      });

      describe(`get()`, () => {
        describe(`on key not overriden by 'prod'`, () => {
          it(`returns value from 'prod'`, () => {
            const value = this.props.get('mailjet.apiKeyPublic');
            expect(value).toEqual('public-key-from-default');
          });
        });

        describe(`on key overriden by 'prod'`, () => {
          it(`returns value from 'prod'`, () => {
            const value = this.props.get('mailjet.apiKeyPrivate');
            expect(value).toEqual('private-key-from-ext-prod');
          });
        });
      });
    });
  });
});
