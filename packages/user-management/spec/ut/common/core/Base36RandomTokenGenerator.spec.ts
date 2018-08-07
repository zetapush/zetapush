import { Base36RandomTokenGenerator, IllegalArgumentError } from '../../../../src';

describe(`Base36RandomTokenGenerator`, () => {
  it(`configured with
      - length = 20
     should
      - have 20 characters
      - contains only numbers and letters`, async () => {
    const generator = new Base36RandomTokenGenerator(20);
    const token = await generator.generate();
    expect(token.value).toMatch(/^[a-zA-Z0-9]{20}$/);
  });
  it(`configured with
      - length = 10
     should
      - have 10 characters
      - contains only numbers and letters`, async () => {
    const generator = new Base36RandomTokenGenerator(10);
    const token = await generator.generate();
    expect(token.value).toMatch(/^[a-zA-Z0-9]{10}$/);
  });
  it(`configured with
      - length = 0
     should
      - throw an error`, async () => {
    expect(() => {
      const generator = new Base36RandomTokenGenerator(0);
    }).toThrowError(IllegalArgumentError, 'Token size must contain at least one character');
  });
});
