import { FuncCallUuidGenerator } from '../../../../src/common/core';
import { IllegalArgumentError } from '../../../../src/common/api';

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
      - fail indicating that function is required`, () => {
    expect(() => {
      const generator = new FuncCallUuidGenerator(null);
      generator.generate();
    }).toThrowError(IllegalArgumentError, 'Generator function is required');
  });
});
