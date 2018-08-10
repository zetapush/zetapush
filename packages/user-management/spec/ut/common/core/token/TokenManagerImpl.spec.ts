import 'jasmine';
import { anything } from 'ts-mockito';
import { StateToken } from '../../../../../src/common/api';
import { TokenManagerImpl } from '../../../../../src/common/core/token/TokenManagerImpl';
import {
  AlreadyUsedTokenError,
  ExpiredTokenError,
  GenerateTokenError
} from '../../../../../src/common/api/exception/TokenError';

describe(`TokenManagerImpl`, () => {
  const tokenGenerator = jasmine.createSpyObj('TokenGenerator', ['generate']);
  const tokenStorage = jasmine.createSpyObj('TokenStorageManager', ['store', 'getFromToken', 'delete']);
  const tokenManager = new TokenManagerImpl(tokenGenerator, tokenStorage);

  it(`configured with
        - existing token with value '42'
        - token is not expirable
        - token was never used
      should :
        - Return the correct token`, async () => {
    // GIVEN
    tokenStorage.getFromToken.and.returnValue({ value: '42', state: StateToken.UNUSED });

    // WHEN
    const returnToken = await tokenManager.validate({ value: '42' });

    // THEN
    expect(returnToken.value).toEqual('42');
    expect(returnToken.state).toEqual(StateToken.ALREADY_USED);
  });

  it(`configured with
        - existing token with value '42'
        - token is not expirable
        - We trying to validate a token already validated
      should :
        - the TokenManager return an error (the token is already used`, async () => {
    // GIVEN
    tokenStorage.getFromToken.and.returnValue({ value: '42', state: StateToken.ALREADY_USED });

    // WHEN / THEN
    try {
      await tokenManager.validate({ value: '42' });
    } catch (error) {
      const expectedError = new AlreadyUsedTokenError(`This token was already used`, anything(), anything());
      expect(error).toEqual(expectedError);
    }
  });

  it(`configured with
        - existing token with value '42'
        - token is expirable
        - token was never but is expired
      should :
        - Return the error : 'ExpiredTokenError'`, async () => {
    // GIVEN
    tokenStorage.getFromToken.and.returnValue({ value: '42', state: StateToken.UNUSED, expires: 1533886823413 });

    // WHEN / THEN
    try {
      await tokenManager.validate({ value: '42' });
    } catch (error) {
      const expectedError = new ExpiredTokenError(`This token is expired`, anything(), anything());
      expect(error).toEqual(expectedError);
    }
  });

  it(`configured with
        - want to generate a token
        - The generator failed
      should :
        - Return the error : 'GeneratorTokenError'`, async () => {
    // GIVEN
    tokenGenerator.generate.and.throwError(new Error());

    // WHEN / THEN
    try {
      await tokenManager.generate();
    } catch (error) {
      const expectedError = new GenerateTokenError(`Failed to generate the token`, anything());
      expect(error).toEqual(expectedError);
    }
  });
});
