import 'jasmine';
import { anything, mock, when, instance } from 'ts-mockito';
import { TokenState, TokenGenerator, ExpirableToken, TokenRepository } from '../../../../../src/common/api';
import { TokenManagerImpl } from '../../../../../src/common/core/token/TokenManagerImpl';
import {
  AlreadyUsedTokenError,
  ExpiredTokenError,
  GenerateTokenError
} from '../../../../../src/common/api/exception/TokenError';
import { TimestampBasedUuidGenerator, Base36RandomTokenGenerator, GdaTokenRepository } from '../../../../../src';

describe(`TokenManagerImpl`, () => {
  const tokenGenerator: TokenGenerator = mock(Base36RandomTokenGenerator);
  const tokenStorage: TokenRepository = mock(GdaTokenRepository);

  describe(`validate()`, () => {
    describe(`a valid token`, () => {
      it(`accpets and return the token`, async () => {
        // GIVEN
        when(tokenStorage.getFromToken(anything())).thenResolve({ token: { value: '42' }, state: TokenState.UNUSED });
        const tokenManager = new TokenManagerImpl(tokenGenerator, instance(tokenStorage));

        // WHEN
        const returnToken = await tokenManager.validate({ value: '42' });

        // THEN
        expect(returnToken.token.value).toEqual('42');
        expect(returnToken.state).toEqual(TokenState.ALREADY_USED);
      });
    });

    describe(`a token already used`, () => {
      it(`fails indicating that the token is already used`, async () => {
        // GIVEN
        when(tokenStorage.getFromToken(anything())).thenResolve({
          token: { value: '42' },
          state: TokenState.ALREADY_USED
        });
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
    });
    describe(`an expired token`, () => {
      it(`fails indicating that the token is expired`, async () => {
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
    });
  });

  describe(`generate()`, () => {
    describe(`with a failing generator`, () => {
      it(`fails indicating that token generation has failed`, async () => {
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
  });
});
