import 'jasmine';
import {
  absolutize,
  DefaultRelativeUrlError,
  MissingBaseUrlError,
  InvalidUrlError
} from '../../../../src/common/utils/url';

describe(`absolutize()`, () => {
  describe(`with base url`, () => {
    describe(`and no configured url`, () => {
      it(`uses the default path`, async () => {
        const url = absolutize(null, 'http://base-url', '#default', 'front', 'configuration.key');
        expect(url).toBe('http://base-url/#default');
      });
    });

    describe(`and empty configured url`, () => {
      it(`uses the base url`, async () => {
        const url = absolutize('', 'http://base-url', '#default', 'front', 'configuration.key');
        expect(url).toBe('http://base-url/');
      });
    });

    describe(`and a configured relative url`, () => {
      it(`concats relative url to base url`, async () => {
        const url = absolutize('relative/url', 'http://base-url', '#default', 'front', 'configuration.key');
        expect(url).toBe('http://base-url/relative/url');
      });
    });

    describe(`and a configured absolute url`, () => {
      it(`uses the configured url`, async () => {
        const url = absolutize('http://absolute/url', 'http://base-url', '#default', 'front', 'configuration.key');
        expect(url).toBe('http://absolute/url');
      });
    });

    describe(`and an invalid configured absolute url`, () => {
      it(`throw a error indicating that URL is not valid`, async () => {
        expect(() => {
          absolutize('http://invalid%url', 'http://base-url', '#default', 'front', 'configuration.key');
        }).toThrowError(InvalidUrlError);
      });
    });

    describe(`containing path`, () => {
      it(`uses the path and the default path`, async () => {
        const url = absolutize(null, 'http://base-url/p/a/t/h', '/default', 'front', 'configuration.key');
        expect(url).toBe('http://base-url/p/a/t/h/default');
      });
    });
  });

  describe(`without base url`, () => {
    describe(`and no configured url`, () => {
      it(`throws an error to indicate that automatic mechanism can't provide URL`, async () => {
        expect(() => {
          absolutize(null, null, '#default', 'front', 'configuration.key');
        }).toThrowError(DefaultRelativeUrlError);
      });
    });

    describe(`and empty configured url`, () => {
      it(`throws an error to indicate that automatic mechanism can't provide URL`, async () => {
        expect(() => {
          absolutize('', null, '#default', 'front', 'configuration.key');
        }).toThrowError(MissingBaseUrlError);
      });
    });

    describe(`and a configured relative url`, () => {
      it(`throws an error to indicate that automatic mechanism can't provide URL`, async () => {
        expect(() => {
          absolutize('relative/url', null, '#default', 'front', 'configuration.key');
        }).toThrowError(MissingBaseUrlError);
      });
    });

    describe(`and a configured absolute url`, () => {
      it(`uses the configured url`, async () => {
        const url = absolutize('http://absolute/url', null, '#default', 'front', 'configuration.key');
        expect(url).toBe('http://absolute/url');
      });
    });

    describe(`and an invalid configured absolute url`, () => {
      it(`throw a error indicating that URL is not valid`, async () => {
        expect(() => {
          absolutize('http://invalid%url', null, '#default', 'front', 'configuration.key');
        }).toThrowError(MissingBaseUrlError);
      });
    });
  });
});
