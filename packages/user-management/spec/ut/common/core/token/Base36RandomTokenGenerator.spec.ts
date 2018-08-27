import { Base36RandomTokenGenerator, IllegalArgumentError } from '../../../../../src';
import 'jasmine';

describe(`Base36RandomTokenGenerator`, () => {
  describe(`generate()`, () => {
    describe(`a 20 characters token`, () => {
      it(`creates a 20 characters token that contains only numbers and letters`, async () => {
        const generator = new Base36RandomTokenGenerator(20);
        const token = await generator.generate();
        expect(token.value).toMatch(/^[a-zA-Z0-9]{20}$/);
      });
    });

    describe(`a 10 characters token`, () => {
      it(`creates a 10 characters token that contains only numbers and letters`, async () => {
        const generator = new Base36RandomTokenGenerator(10);
        const token = await generator.generate();
        expect(token.value).toMatch(/^[a-zA-Z0-9]{10}$/);
      });
    });

    describe(`with 0 length`, () => {
      it(`fails indicating that size is too short`, async () => {
        expect(() => {
          const generator = new Base36RandomTokenGenerator(0);
        }).toThrowError(IllegalArgumentError, 'Token size must contain at least one character');
      });
    });
  });
});
