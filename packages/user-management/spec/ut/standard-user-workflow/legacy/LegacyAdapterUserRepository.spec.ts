import 'jasmine';

import {
  LegacyAdapterUserRepository,
  StandardAccountStatus,
  LoginAlreadyUsedError,
  LegacySimpleError,
  LegacyLoginAlreadyUsedError
} from '../../../../src';
import { IllegalStateError } from '../../../../src/common/api';

describe(`LegacyAdapterUserRepository`, () => {
  describe(`addUser()`, () => {
    beforeEach(() => {
      this.simple = jasmine.createSpyObj('Simple', ['checkAccount', 'setStatus', 'createAccount']);
      this.gda = jasmine.createSpyObj('Gda', ['get', 'put']);
      this.gdaConfigurer = jasmine.createSpyObj('GdaConfigurer', ['createTable']);
      this.userRepository = new LegacyAdapterUserRepository(this.simple, this.gda, this.gdaConfigurer);
      // gda.get.and.returnValue();
      // gda.put.and.returnValue();
    });

    it(`on valid account should return accountId`, async () => {
      // GIVEN
      this.simple.createAccount.and.returnValue({
        status: { active: false, data: StandardAccountStatus.WaitingConfirmation },
        userKey: 'abc',
        fields: { login: 'odile.deray', accountId: '42' }
      });
      this.simple.checkAccount.and.returnValue({
        fields: {
          userProfile: {
            userKey: 'abc',
            login: 'odile.deray'
          }
        },
        status: {
          active: false,
          data: StandardAccountStatus.WaitingConfirmation
        }
      });
      this.gda.get.and.returnValue({
        result: {
          data: { userKey: 'abc', login: 'odile.deray' }
        }
      });

      // WHEN
      const account = await this.userRepository.addUser(
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
      expect(account).toBeDefined();
      expect(account).not.toBeNull();
      expect(account.accountId).toBe('42');
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
        }).toThrowError(LegacyLoginAlreadyUsedError, 'Login "odile.deray" is already used');
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
  });
  describe(`getUserKey()`, () => {
    beforeEach(() => {
      this.simple = jasmine.createSpyObj('Simple', ['checkAccount', 'setStatus', 'createAccount']);
      this.gda = jasmine.createSpyObj('Gda', ['get', 'put']);
      this.gdaConfigurer = jasmine.createSpyObj('GdaConfigurer', ['createTable']);
      this.userRepository = new LegacyAdapterUserRepository(this.simple, this.gda, this.gdaConfigurer);
    });

    it(`on valid account should return userKey`, async () => {
      // GIVEN
      this.gda.get.and.returnValue({
        result: {
          data: { userKey: 'abc', login: 'odile.deray' }
        }
      });

      // WHEN
      const userKey = await this.userRepository.getUserKey('42');

      // THEN
      expect(userKey).toBeDefined();
      expect(userKey).not.toBeNull();
      expect(userKey).toBe('abc');
    });
  });
});
