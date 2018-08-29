import 'jasmine';
import { PropertyAccessorWrapper } from '../../../src';

describe(`PropertyAccessorWrapper`, () => {
  beforeEach(() => {
    this.obj = {
      a: {
        b: 3,
        c: 4,
        d: {
          e: 'e'
        },
        f: ['g', 'h']
      },
      0: 0
    };
    this.accessor = new PropertyAccessorWrapper(this.obj);
  });

  describe(`.get()`, () => {
    describe(`on first level key`, () => {
      it(`returns the whole object of the first level`, async () => {
        const value = this.accessor.get('a');
        expect(value).toEqual(this.obj['a']);
      });
    });

    describe(`on last level key`, () => {
      it(`returns the value`, async () => {
        const value = this.accessor.get('a.b');
        expect(value).toEqual(this.obj['a']['b']);
      });
    });

    describe(`on third level key`, () => {
      it(`returns the value`, async () => {
        const value = this.accessor.get('a.d.e');
        expect(value).toEqual(this.obj['a']['d']['e']);
      });
    });

    describe(`on key that points to an array`, () => {
      it(`returns the array`, async () => {
        const value = this.accessor.get('a.f');
        expect(value).toEqual(this.obj['a']['f']);
      });
    });

    describe(`on key that points to a value in an array`, () => {
      it(`returns the value of the right index`, async () => {
        const value = this.accessor.get('a.f.1');
        expect(value).toEqual(this.obj['a']['f'][1]);
      });
    });

    describe(`on key that points to a falsy value`, () => {
      it(`returns the value`, async () => {
        const value = this.accessor.get('0');
        expect(value).toEqual(this.obj['0']);
      });
    });

    describe(`without key`, () => {
      it(`returns the whole object`, async () => {
        const value = this.accessor.get('');
        expect(value).toEqual(this.obj);
      });
    });

    describe(`with invalid key`, () => {
      it(`returns null`, async () => {
        const value = this.accessor.get('---{}[]');
        expect(value).toBeNull();
      });
      it(`returns null`, async () => {
        const value = this.accessor.get('....');
        expect(value).toBeNull();
      });
    });

    describe(`with key that points to nothing`, () => {
      it(`returns null`, async () => {
        const value = this.accessor.get('a.Z');
        expect(value).toBeNull();
      });
    });
  });

  describe(`.has()`, () => {
    describe(`on first level key`, () => {
      it(`returns true`, async () => {
        const value = this.accessor.has('a');
        expect(value).toBe(true);
      });
    });

    describe(`on last level key`, () => {
      it(`returns true`, async () => {
        const value = this.accessor.has('a.b');
        expect(value).toBe(true);
      });
    });

    describe(`on third level key`, () => {
      it(`returns true`, async () => {
        const value = this.accessor.has('a.d.e');
        expect(value).toBe(true);
      });
    });

    describe(`on key that points to an array`, () => {
      it(`returns true`, async () => {
        const value = this.accessor.has('a.f');
        expect(value).toBe(true);
      });
    });

    describe(`on key that points to a value in an array`, () => {
      it(`returns true`, async () => {
        const value = this.accessor.has('a.f.1');
        expect(value).toBe(true);
      });
    });

    describe(`without key`, () => {
      it(`returns true`, async () => {
        const value = this.accessor.has('');
        expect(value).toBe(true);
      });
    });

    describe(`with invalid key`, () => {
      it(`returns false`, async () => {
        const value = this.accessor.has('---{}[]');
        expect(value).toBe(false);
      });
      it(`returns false`, async () => {
        const value = this.accessor.has('....');
        expect(value).toBe(false);
      });
    });

    describe(`with key that points to nothing`, () => {
      it(`returns false`, async () => {
        const value = this.accessor.has('a.Z');
        expect(value).toBe(false);
      });
    });
  });
});
