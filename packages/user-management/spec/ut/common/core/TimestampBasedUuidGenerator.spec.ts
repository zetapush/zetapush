import { TimestampBasedUuidGenerator, IllegalArgumentError } from '../../../../src';
import 'jasmine';

describe(`TimestampBasedUuidGenerator`, () => {
  describe(`generate()`, () => {
    describe(`a 20 characters uuid`, () => {
      it(`creates a 20 characters token that contains only numbers and letters`, async () => {
        const generator = new TimestampBasedUuidGenerator(20);
        const token = await generator.generate();
        expect(token.value).toMatch(/^[a-zA-Z0-9]{20}$/);
      });
    });

    describe(`a 10 characters token`, () => {
      it(`creates a 10 characters token that contains only numbers and letters`, async () => {
        const generator = new TimestampBasedUuidGenerator(10);
        const token = await generator.generate();
        expect(token.value).toMatch(/^[a-zA-Z0-9]{10}$/);
      });
    });

    describe(`with 0 length`, () => {
      it(`fails indicating that size is too short`, async () => {
        expect(() => {
          const generator = new TimestampBasedUuidGenerator(0);
        }).toThrowError(IllegalArgumentError, 'Uuid size must contain at least one character');
      });
    });
  });
});
