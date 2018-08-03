import { FuncCallUuidGenerator, IllegalArgumentError } from '../../../../src';

describe(`FuncCallUuidGenerator`, () => {
  it(`configured with
      - () => 'azerty'
     should
      - return 'azerty'`, async () => {
    const generator = new FuncCallUuidGenerator(async () => ({ value: 'azerty' }));
    const token = await generator.generate();
    expect(token.value).toBe('azerty');
  });
  it(`configured with
      - no function
     should
      - fail indicating that function is required`, async () => {
    expect(async () => {
      const generator = new FuncCallUuidGenerator(null);
      await generator.generate();
    }).toThrowError(IllegalArgumentError, 'Generator function is required');
  });
});
