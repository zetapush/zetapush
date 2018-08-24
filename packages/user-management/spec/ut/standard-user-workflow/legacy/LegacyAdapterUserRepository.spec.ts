import 'jasmine';

import {
  LegacyAdapterUserRepository,
  StandardAccountStatus,
  LoginAlreadyUsedError,
  LegacySimpleError
} from '../../../../src';
import { IllegalStateError } from '../../../../src/common/api';

describe(`LegacyAdapterUserRepository`, () => {
  describe(`addUser()`, () => {
    beforeEach(() => {
      this.simple = jasmine.createSpyObj('Simple', ['createUser', 'checkUser', 'setStatus', 'createAccount']);
      this.gda = jasmine.createSpyObj('Gda', ['get', 'put']);
      this.gdaConfigurer = jasmine.createSpyObj('GdaConfigurer', ['createTable']);
      this.userRepository = new LegacyAdapterUserRepository(this.simple, this.gda, this.gdaConfigurer);
      // gda.get.and.returnValue();
      // gda.put.and.returnValue();
    });

    it(`on valid account should return accountId`, async () => {
      // GIVEN
      this.simple.createAccount.and.returnValue({
        status: { active: false },
        userKey: 'abc',
        fields: { login: 'odile.deray' }
      });
      this.simple.checkUser.and.returnValue({ userProfile: { userKey: 'abc', login: 'odile.deray' } });
      this.gda.get.and.returnValue({
        result: {
          data: { userKey: 'abc', login: 'odile.deray' }
        }
      });

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
      this.simple.createAccount.and.throwError(err);
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

    it(`Missing the login of the user`, async () => {
      // GIVE,
      const err = new Error('foobar');
      (<any>err).code = 'MISSING_MANDATORY_FIELDS';
      this.simple.createAccount.and.throwError(err);

      // WHEN
      try {
        await this.userRepository.addUser(
          {
            password: '123456'
          },
          {
            firstname: 'Odile',
            lastname: 'DERAY'
          },
          StandardAccountStatus.WaitingConfirmation,
          '42'
        );
        fail('should have failed with IllegalStateError exception');
      } catch (e) {
        // THEN
        expect(() => {
          throw e;
        }).toThrowError(IllegalStateError);
      }
    });

    it(`The Legacy ZetaPush storage failed to retrieve the user account and should return 'LegacySimpleError' error`, async () => {
      // GIVEN
      this.simple.createUser.and.returnValue({ userKey: 'abc', login: 'odile.deray' });
      const err = new Error('foobar');
      (<any>err).code = 'FAILED_ACCESS_DATABASE'; // False code, important is that an error was threw
      this.gda.get.and.throwError(err);
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
        fail('should have failed with "LegacySimpleError" exception');
      } catch (e) {
        // THEN
        expect(() => {
          throw e;
        }).toThrowError(LegacySimpleError, `Account creation for 'odile.deray' has failed`);
      }
    });

    it(`The Legacy ZetaPush storage retrieve no result for the user account and should return 'LegacySimpleError' error`, async () => {
      // GIVEN
      this.simple.createUser.and.returnValue({ userKey: 'abc', login: 'odile.deray' });
      this.gda.get.and.returnValue({ result: null });
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
        fail('should have failed with "LegacySimpleError" exception');
      } catch (e) {
        // THEN
        expect(() => {
          throw e;
        }).toThrowError(LegacySimpleError, `Account creation for 'odile.deray' has failed`);
      }
    });
  });
});
