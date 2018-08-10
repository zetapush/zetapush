import {} from 'jasmine';
import { Base36RandomTokenGenerator } from '../../../../../src';

describe(`Base64RandomTokenValidation`, () => {
  it(`configured with :
         - Existing stored token
         - Token is still valid
        should
         - Validate the token and delete it`, async () => {
    // Given
    const generator = new Base36RandomTokenGenerator();
    const token = await generator.generate();
  });

  it(`configured with :
         - Existing stored token
         - Token doesn't exists
        should
         - Throw an error for non existing token`, async () => {
    // TODO:
  });
});
