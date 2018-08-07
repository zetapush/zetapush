import { TimestampBasedUuidGenerator, IllegalArgumentError } from '../../../../src';

describe(`TimestampBasedUuidGenerator`, () => {
  it(`configured with
      - length = 20
     should
      - have 20 characters
      - contains only numbers`, async () => {
    const generator = new TimestampBasedUuidGenerator(20);
    const token = await generator.generate();
    expect(token.value).toMatch(/^[a-zA-Z0-9]{20}$/);
  });
  it(`configured with
      - length = 10
     should
      - have 10 characters
      - contains only numbers and letters`, async () => {
    const generator = new TimestampBasedUuidGenerator(10);
    const token = await generator.generate();
    expect(token.value).toMatch(/^[a-zA-Z0-9]{10}$/);
  });
  it(`configured with
      - length = 0
     should
      - throw an error`, async () => {
    expect(() => {
      const generator = new TimestampBasedUuidGenerator(0);
    }).toThrowError(IllegalArgumentError, 'Uuid size must contain at least one character');
  });
});
