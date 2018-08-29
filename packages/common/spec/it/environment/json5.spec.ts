import 'jasmine';
import {
  Json5ConfigurationProperties,
  MissingConfigurationProperty,
  ConfigurationFileLoadError,
  ConfigurationStateError
} from '../../../src';

describe(`json5 properties`, () => {
  describe(`with configuration loaded`, () => {
    beforeEach(async () => {
      this.props = new Json5ConfigurationProperties(__dirname + '/internal/fake.json');
      await this.props.load();
    });

    describe(`.has()`, () => {
      describe(`on first level key`, () => {
        it(`returns true`, async () => {
          const value = this.props.has('a');
          expect(value).toEqual(true);
        });
      });

      describe(`on last level key`, () => {
        it(`returns true`, async () => {
          const value = this.props.has('a.b');
          expect(value).toEqual(true);
        });
      });

      describe(`on third level key`, () => {
        it(`returns true`, async () => {
          const value = this.props.has('a.d.e');
          expect(value).toEqual(true);
        });
      });

      describe(`without key`, () => {
        it(`returns true`, async () => {
          const value = this.props.has('');
          expect(value).toEqual(true);
        });
      });

      describe(`with invalid key`, () => {
        it(`returns false`, async () => {
          const value = this.props.has('---{}[]');
          expect(value).toEqual(false);
        });
        it(`returns false`, async () => {
          const value = this.props.has('....');
          expect(value).toEqual(false);
        });
      });

      describe(`with key that points to nothing`, () => {
        it(`returns false`, async () => {
          const value = this.props.has('a.Z');
          expect(value).toEqual(false);
        });
      });
    });

    describe(`.get()`, () => {
      describe(`on first level key`, () => {
        it(`returns the whole object of the first level`, async () => {
          const value = this.props.get('a');
          expect(value).toEqual({
            b: 3,
            c: 4,
            d: {
              e: 'e'
            },
            f: ['g', 'h']
          });
        });
      });

      describe(`on last level key`, () => {
        it(`returns the value`, async () => {
          const value = this.props.get('a.b');
          expect(value).toEqual(3);
        });
      });

      describe(`on third level key`, () => {
        it(`returns the value`, async () => {
          const value = this.props.get('a.d.e');
          expect(value).toEqual('e');
        });
      });

      describe(`on key that points to an array`, () => {
        it(`returns the array`, async () => {
          const value = this.props.get('a.f');
          expect(value).toEqual(['g', 'h']);
        });
      });

      describe(`on key that points to a value in an array`, () => {
        it(`returns the value of the right index`, async () => {
          const value = this.props.get('a.f.1');
          expect(value).toEqual('h');
        });
      });

      describe(`without key`, () => {
        it(`returns the whole object`, async () => {
          const value = this.props.get('');
          expect(value).toEqual({
            a: {
              b: 3,
              c: 4,
              d: {
                e: 'e'
              },
              f: ['g', 'h']
            },
            '0': 0,
            null: null,
            empty: ''
          });
        });
      });

      describe(`with invalid key`, () => {
        it(`returns null`, async () => {
          const value = this.props.get('---{}[]');
          expect(value).toBeNull();
        });
        it(`returns null`, async () => {
          const value = this.props.get('....');
          expect(value).toBeNull();
        });
      });

      describe(`with key that points to nothing`, () => {
        it(`returns null`, async () => {
          const value = this.props.get('a.Z');
          expect(value).toBeNull();
        });
      });
    });

    describe(`.get() with default value`, () => {
      describe(`on missing key`, () => {
        it(`returns the default value`, async () => {
          const value = this.props.get('Z', 'default');
          expect(value).toEqual('default');
        });
      });

      describe(`on value that returns null`, () => {
        it(`returns the default value`, async () => {
          const value = this.props.get('null', 'default');
          expect(value).toEqual('default');
        });
      });

      // describe(`on value that returns undefined`, () => {
      //   it(`returns the default value`, async () => {
      //     const value = this.props.get('undefined', 'default');
      //     expect(value).toEqual('default');
      //   });
      // });

      describe(`on value that returns 0`, () => {
        it(`returns 0`, async () => {
          const value = this.props.get('0', 'default');
          expect(value).toEqual(0);
        });
      });

      describe(`on value that returns an empty strnig`, () => {
        it(`returns the empty string`, async () => {
          const value = this.props.get('empty');
          expect(value).toEqual('');
        });
      });
    });

    describe(`.getOrThrow()`, () => {
      describe(`on missing key`, () => {
        it(`fails indicating that property is missing`, async () => {
          expect(() => {
            this.props.getOrThrow('Z');
          }).toThrowError(MissingConfigurationProperty, `The key 'Z' is not defined`);
        });
      });

      describe(`on value that returns null`, () => {
        it(`fails indicating that property value is missing`, async () => {
          expect(() => {
            this.props.getOrThrow('null');
          }).toThrowError(MissingConfigurationProperty, `The key 'null' is defined but the value is undefined or null`);
        });
      });

      // describe(`on value that returns undefined`, () => {
      //   it(`returns the default value`, async () => {
      //     const value = this.props.get('undefined', 'default');
      //     expect(value).toEqual('default');
      //   });
      // });

      describe(`on value that returns 0`, () => {
        it(`returns 0`, async () => {
          const value = this.props.getOrThrow('0');
          expect(value).toEqual(0);
        });
      });

      describe(`on value that returns an empty strnig`, () => {
        it(`returns the empty string`, async () => {
          const value = this.props.getOrThrow('empty');
          expect(value).toEqual('');
        });
      });
    });
  });

  describe(`without configuration loaded`, () => {
    beforeEach(async () => {
      this.props = new Json5ConfigurationProperties(__dirname + '/internal/application.json');
    });

    describe(`.has()`, () => {
      it(`fails indicating that configuration is not loaded`, async () => {
        expect(() => {
          this.props.has('a');
        }).toThrowError(ConfigurationStateError);
      });
    });

    describe(`.get()`, () => {
      it(`fails indicating that configuration is not loaded`, async () => {
        expect(() => {
          this.props.get('a');
        }).toThrowError(ConfigurationStateError);
      });
    });

    describe(`.get() with default value`, () => {
      it(`fails indicating that configuration is not loaded`, async () => {
        expect(() => {
          this.props.get('a', 'default');
        }).toThrowError(ConfigurationStateError);
      });
    });

    describe(`.getOrThrow()`, () => {
      it(`fails indicating that configuration is not loaded`, async () => {
        expect(() => {
          this.props.getOrThrow('a');
        }).toThrowError(ConfigurationStateError);
      });
    });
  });
});
