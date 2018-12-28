import 'jasmine';
import {
  Base36RandomTokenGenerator,
  GdaTokenRepository,
  TokenFactory
} from '../../../../../src/common/core/token/index';
import { GetTokenFromStorageError, TokenNotFoundError } from '../../../../../src/common/api/exception/TokenError';
import { given, autoclean, runInWorker } from '@zetapush/testing';
import { Gda, GdaConfigurer } from '@zetapush/platform-legacy';
import { anything } from 'ts-mockito';

describe(`GdaTokenRepository`, () => {
  beforeEach(async () => {
    await given()
      .credentials()
      /**/ .fromEnv()
      /**/ .newApp()
      /**/ .and()
      .worker()
      /**/ .dependencies(Gda, GdaConfigurer, TokenFactory)
      /**/ .and()
      .apply(this);
  }, 5 * 60 * 1000);

  afterEach(async () => {
    await autoclean(this);
  });

  describe(`store()`, () => {
    describe(`valid token`, () => {
      it(
        `stores the token in database and returns it`,
        async () => {
          await runInWorker(this, async (gda: Gda, gdaConfigurer: GdaConfigurer, tokenFactory: TokenFactory) => {
            const token = { value: '123456789' };
            const storageManager = new GdaTokenRepository(gda, gdaConfigurer, tokenFactory);
            storageManager.onApplicationBootstrap();

            const mockAssociatedValue = '123456';

            // Save the token in the database with the StorageTokenManager
            await storageManager.store(token, mockAssociatedValue);

            // Get the token from the database
            const storedToken = await storageManager.getFromToken(token);

            expect(storedToken.associatedValue).toEqual(mockAssociatedValue);
            expect(storedToken.token.value).toEqual(token.value);
          });
        },
        5 * 60 * 1000
      );
    });

    describe(`getFromToken()`, () => {
      describe(`invalid token`, () => {
        it(
          `fails indicating that the token doesn't match`,
          async () => {
            await runInWorker(this, async (gda: Gda, gdaConfigurer: GdaConfigurer, tokenFactory: TokenFactory) => {
              const token = { value: '123456789' };
              const newToken = { value: '987654321' };
              const storageManager = new GdaTokenRepository(gda, gdaConfigurer, tokenFactory);
              storageManager.onApplicationBootstrap();

              const mockAssociatedValue = '123456';

              // Save the token in the database with the StorageTokenManager
              await storageManager.store(token, mockAssociatedValue);

              // Get the token from the database, should return an error
              try {
                await storageManager.getFromToken(newToken);
                fail('should have failed with GetTokenFromStorageError exception');
              } catch (e) {
                expect(() => {
                  throw e;
                }).toThrowError(TokenNotFoundError, `No matching token found`);
              }
            });
          },
          5 * 60 * 1000
        );
      });
    });
  });
});
