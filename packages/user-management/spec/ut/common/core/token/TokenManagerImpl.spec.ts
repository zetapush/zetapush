import 'jasmine';
import { anything, mock, when, instance } from 'ts-mockito';
import { TokenState, TokenGenerator, TokenStorageManager, ExpirableToken } from '../../../../../src/common/api';
import { TokenManagerImpl } from '../../../../../src/common/core/token/TokenManagerImpl';
import {
  AlreadyUsedTokenError,
  ExpiredTokenError,
  GenerateTokenError
} from '../../../../../src/common/api/exception/TokenError';
import {
  TimestampBasedUuidGenerator,
  DefaultStorageTokenManager,
  Base36RandomTokenGenerator
} from '../../../../../src';

describe(`TokenManagerImpl`, () => {
  const tokenGenerator: TokenGenerator = mock(Base36RandomTokenGenerator);
  const tokenStorage: TokenStorageManager = mock(DefaultStorageTokenManager);

  it(`configured with
  - existing token with value '42'
  - token is not expirable
  - token was never used
  should :
  - Return the correct token`, async () => {
    // GIVEN
    when(tokenStorage.getFromToken(anything())).thenResolve({ token: { value: '42' }, state: TokenState.UNUSED });
    const tokenManager = new TokenManagerImpl(tokenGenerator, instance(tokenStorage));

    // WHEN
    const returnToken = await tokenManager.validate({ value: '42' });

    // THEN
    expect(returnToken.token.value).toEqual('42');
    expect(returnToken.state).toEqual(TokenState.ALREADY_USED);
  });

  it(`configured with
        - existing token with value '42'
        - token is not expirable
        - We trying to validate a token already validated
      should :
        - the TokenManager return an error (the token is already used`, async () => {
    // GIVEN
    when(tokenStorage.getFromToken(anything())).thenResolve({ token: { value: '42' }, state: TokenState.ALREADY_USED });
    const tokenManager = new TokenManagerImpl(tokenGenerator, instance(tokenStorage));

    // WHEN
    try {
      await tokenManager.validate({ value: '42' });
      fail('should have failed with AlreadyUsedTokenError exception');
    } catch (e) {
      // THEN
      expect(() => {
        throw e;
      }).toThrowError(AlreadyUsedTokenError, `This token was already used`);
    }
  });

  it(`configured with
        - existing token with value '42'
        - token is expirable
        - token was never but is expired
      should :
        - Return the error : 'ExpiredTokenError'`, async () => {
    // GIVEN
    when(tokenStorage.getFromToken(anything())).thenResolve({
      token: new ExpirableToken({ value: '42' }, 1533886823413),
      state: TokenState.UNUSED
    });
    const tokenManager = new TokenManagerImpl(tokenGenerator, instance(tokenStorage));

    // WHEN
    try {
      await tokenManager.validate({ value: '42' });
      fail('should have failed with ExpiredTokenError exception');
    } catch (e) {
      // THEN
      expect(() => {
        throw e;
      }).toThrowError(ExpiredTokenError, `This token is expired`);
    }
  });

  it(`configured with
        - want to generate a token
        - The generator failed
      should :
        - Return the error : 'GeneratorTokenError'`, async () => {
    // GIVEN
    when(tokenGenerator.generate()).thenReject(new Error());
    const tokenManager = new TokenManagerImpl(instance(tokenGenerator), tokenStorage);

    // WHEN
    try {
      await tokenManager.generate();
      fail('should have failed with GenerateTokenError exception');
    } catch (e) {
      // THEN
      expect(() => {
        throw e;
      }).toThrowError(GenerateTokenError, `Failed to generate the token`);
    }
  });
});
