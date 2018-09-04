import 'jasmine';
import { EnvironmentVariablesConfigurationProperties, MissingConfigurationProperty } from '../../../src';
import { mock } from 'ts-mockito';

describe(`env-variables properties`, () => {
  beforeEach(async () => {
    this.env = {
      A: 'a',
      OBJ_A: 'a',
      OBJ_B: 'b',
      OBJ_C_D: 'd',
      OBJ_E_0: 'g',
      OBJ_E_1: 'h',
      NUMBER: '1',
      BOOLEAN: 'true',
      NULL: 'null',
      UNDEFINED: 'undefined',
      OBJECT: '{"foo": "bar"}',
      '0': '0',
      EMPTY: ''
    };
    this.props = new EnvironmentVariablesConfigurationProperties(this.env);
  });

  describe(`.get()`, () => {
    describe(`on first level key that points to a string`, () => {
      it(`returns the string`, async () => {
        const value = this.props.get('a');
        expect(value).toEqual('a');
      });
    });

    describe(`on key that points to a string parseable as number`, () => {
      it(`returns the number`, async () => {
        const value = this.props.get('number');
        expect(value).toEqual(1);
      });
    });

    describe(`on key that points to a string parseable as boolean`, () => {
      it(`returns the number`, async () => {
        const value = this.props.get('boolean');
        expect(value).toEqual(true);
      });
    });

    describe(`on key that points to a string parseable as object`, () => {
      it(`returns the object`, async () => {
        const value = this.props.get('object');
        expect(value).toEqual({ foo: 'bar' });
      });
    });

    describe(`on last level key`, () => {
      it(`returns the value`, async () => {
        const value = this.props.get('obj.c.d');
        expect(value).toEqual('d');
      });
    });

    // TODO: support partial keys ?
    // describe(`on first level key that points a partial environment variable`, () => {
    //   it(`returns the object`, async () => {
    //     const value = this.props.get('obj');
    //     expect(value).toEqual({
    //       'a': 'a',
    //       'b': 'b',
    //       'c': {
    //         'd': 'd'
    //       },
    //       'e': ['g', 'h']
    //     });
    //   });
    // });

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
