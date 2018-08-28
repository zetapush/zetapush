import 'jasmine';

import { LegacyAdapterUserRepository, StandardAccountStatus, LoginAlreadyUsedError } from '../../../../src';

describe(`LegacyAdapterUserRepository`, () => {
  describe(`addUser()`, () => {
    beforeEach(() => {
      this.simple = jasmine.createSpyObj('Simple', ['createUser']);
      this.gda = jasmine.createSpyObj('Gda', ['get', 'put']);
      this.gdaConfigurer = jasmine.createSpyObj('GdaConfigurer', ['createTable']);
      this.userRepository = new LegacyAdapterUserRepository(this.simple, this.gda, this.gdaConfigurer);
      // gda.get.and.returnValue();
      // gda.put.and.returnValue();
    });

    it(`on valid account should return accountId`, async () => {
      // GIVEN
      this.simple.createUser.and.returnValue({ userKey: 'abc', login: 'odile.deray' });
      // WHEN
      const accountId = await this.userRepository.addUser(
        {
          login: 'odile.deray',
          password: '123456'
        },
        {
          firstname: 'Odile',
          lastname: 'DERAY'
        },
        StandardAccountStatus.WaitingConfirmation,
        '42'
      );
      // THEN
      expect(accountId).toBeDefined();
      expect(accountId).not.toBeNull();
      expect(accountId).toBe('42');
    });

    it(`using login of someone else should throw LoginAlreadyUsedError`, async () => {
      // GIVEN
      const err = new Error('foobar');
      (<any>err).code = 'ACCOUNT_EXISTS';
      this.simple.createUser.and.throwError(err);
      // WHEN
      try {
        await this.userRepository.addUser(
          {
            login: 'odile.deray',
            password: '123456'
          },
          {
            firstname: 'Odile',
            lastname: 'DERAY'
          },
          StandardAccountStatus.WaitingConfirmation,
          '42'
        );
        fail('should have failed with LoginAlreadyUsedError exception');
      } catch (e) {
        // THEN
        expect(() => {
          throw e;
        }).toThrowError(LoginAlreadyUsedError, 'Login "odile.deray" is already used');
      }
    });
  });
});
