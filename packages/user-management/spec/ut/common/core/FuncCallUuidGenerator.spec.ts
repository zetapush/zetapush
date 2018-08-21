import { FuncCallUuidGenerator, IllegalArgumentError } from '../../../../src';
import 'jasmine';

describe(`FuncCallUuidGenerator`, () => {
  describe(`generate()`, () => {
    describe(`with a valid function`, () => {
      it(`returns function result`, async () => {
        const generator = new FuncCallUuidGenerator(async () => ({ value: 'azerty' }));
        const token = await generator.generate();
        expect(token.value).toBe('azerty');
      });
    });

    describe(`without function`, () => {
      it(`fails indicating that function is required`, async () => {
        expect(() => {
          const generator = new FuncCallUuidGenerator(null);
        }).toThrowError(IllegalArgumentError, 'Generator function is required');
      });
    });
  });
});
