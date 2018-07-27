import { Base36RandomTokenGenerator } from '../../../../src/common/core';
import { IllegalArgumentError } from '../../../../src/common/api';

describe(`Base36RandomTokenGenerator`, () => {
  it(`configured with
      - length = 20
     should
      - have 20 characters
      - contains only numbers and letters`, () => {
    const generator = new Base36RandomTokenGenerator(20);
    const token = generator.generate();
    expect(token.value).toMatch(/^[a-zA-Z0-9]{20}$/);
  });
  it(`configured with
      - length = 10
     should
      - have 10 characters
      - contains only numbers and letters`, () => {
    const generator = new Base36RandomTokenGenerator(10);
    const token = generator.generate();
    expect(token.value).toMatch(/^[a-zA-Z0-9]{10}$/);
  });
  it(`configured with
      - length = 0
     should
      - throw an error`, () => {
    expect(() => {
      const generator = new Base36RandomTokenGenerator(0);
      generator.generate();
    }).toThrowError(IllegalArgumentError, 'Token size must contain at least one character');
  });
});
