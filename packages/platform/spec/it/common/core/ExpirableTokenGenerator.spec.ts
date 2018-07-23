import { ExpirableTokenGenerator, Base36RandomTokenGenerator } from '../../../../src/common/core';
import {} from 'jasmine';

describe(`ExpirableTokenGenerator`, () => {
  it(`configured with
      - validity = 5s
      - token creation is delegated to Base36RandomTokenGenerator
     should
      - expire in a date 5s in the future
      - have 20 characters (inherited)
      - contains only numbers and letters (inherited)`, () => {
    const generator = new ExpirableTokenGenerator(new Base36RandomTokenGenerator(20), 5000);
    const token = generator.generate();
    expect(token.expires).toBeGreaterThanOrEqual(new Date().valueOf() + 4900);
    expect(token.expires).toBeLessThanOrEqual(new Date().valueOf() + 5100);
    expect(token.value).toMatch(/^[a-zA-Z0-9]{20}$/);
  });
});
