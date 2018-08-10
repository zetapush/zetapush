import {} from 'jasmine';
import { DefaultStorageTokenManager, Base36RandomTokenGenerator } from '../../../../../src/common/core/token/index';
import { GetTokenFromStorageError } from '../../../../../src/common/api/exception/TokenError';
import { StateToken } from '../../../../../src/common/api';
import { given, autoclean, runInWorker } from '@zetapush/testing';
import { Gda, GdaConfigurer } from '@zetapush/platform-legacy';
import { anything } from 'ts-mockito';

describe(`DefaultStorageTokenManager`, () => {
  beforeEach(async () => {
    await given()
      .credentials()
      .fromEnv()
      .newApp()
      .and()
      .apply(this);
  });

  afterEach(async () => {
    await autoclean(this);
  });

  it(`should :
        - Store the token in the database
        - Return the correct token from the database`, async () => {
    await runInWorker(this, [Gda, GdaConfigurer], async (gda: Gda, gdaConfigurer: GdaConfigurer) => {
      const tokenGenerator = new Base36RandomTokenGenerator(20);
      const token = await tokenGenerator.generate();
      const storageManager = new DefaultStorageTokenManager(gda, gdaConfigurer);

      // FIXME:
      // WHY ?? Because the 'onApplicationBootstrap' method is never called, I don't know why...
      await storageManager.onApplicationBootstrap();

      const mockAssociatedValue = '123456';

      // Save the token in the database with the StorageTokenManager
      await storageManager.store(token, mockAssociatedValue);

      // Get the token from the database
      const storedToken = await storageManager.getFromToken(token);

      expect(storedToken.associatedValue).toEqual(mockAssociatedValue);
      expect(storedToken.state).toEqual(StateToken.UNUSED);
      expect(storedToken.value).toEqual(token.value);
    });
  });

  it(`given :
        - Want to get an inexisting token
      should :
        - Return the proper error`, async () => {
    await runInWorker(this, [Gda, GdaConfigurer], async (gda: Gda, gdaConfigurer: GdaConfigurer) => {
      const tokenGenerator = new Base36RandomTokenGenerator(20);
      const token = await tokenGenerator.generate();
      const newToken = await tokenGenerator.generate();
      const storageManager = new DefaultStorageTokenManager(gda, gdaConfigurer);

      // FIXME:
      // WHY ?? Because the 'onApplicationBootstrap' method is never called, I don't know why...
      await storageManager.onApplicationBootstrap();

      const mockAssociatedValue = '123456';

      // Save the token in the database with the StorageTokenManager
      await storageManager.store(token, mockAssociatedValue);

      // Get the token from the database, should return an error
      expect(await storageManager.getFromToken(newToken)).toThrow(
        new GetTokenFromStorageError(
          `The request to retrieve the token from the storage has no result`,
          anything(),
          anything()
        )
      );
    });
  });
});
