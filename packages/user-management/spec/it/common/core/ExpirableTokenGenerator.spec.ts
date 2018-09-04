import { ExpirableTokenGenerator, Base36RandomTokenGenerator } from '../../../../src';
import 'jasmine';

describe(`ExpirableTokenGenerator`, () => {
  describe(`generate()`, () => {
    describe(`that expires in 5 seconds`, () => {
      it(`generates a token with a date 5 seconds in the future`, async () => {
        const generator = new ExpirableTokenGenerator(new Base36RandomTokenGenerator(20), 5000);
        const token = await generator.generate();
        expect(token.expires).toBeGreaterThanOrEqual(new Date().valueOf() + 4900);
        expect(token.expires).toBeLessThanOrEqual(new Date().valueOf() + 5100);
        expect(token.value).toMatch(/^[a-zA-Z0-9]{20}$/);
      });
    });
  });
});
