import 'jasmine';
import { LoginPasswordAccountCreationManager, StandardAccountStatus } from '../../../../../src';
import { LoginAlreadyUsedError } from '../../../../../src/standard-user-workflow/core/exceptions/AccountCreationError';

describe(`LoginPasswordAccountCreationManager`, () => {
  beforeEach(() => {
    this.userRepository = jasmine.createSpyObj('UserRepository', ['exists', 'addUser']);
    this.uuidGenerator = jasmine.createSpyObj('UuidGenerator', ['generate']);
    this.accountStatusProvider = jasmine.createSpyObj('AccountStatusProvider', ['getStatus']);
    this.creationManager = new LoginPasswordAccountCreationManager(
      this.userRepository,
      this.uuidGenerator,
      this.accountStatusProvider
    );
  });

  describe(`.createAccount()`, () => {
    describe(`on valid account`, () => {
      it(`creates the account and returns it with an identifier and WaitingConfirmation status`, async () => {
        // GIVEN
        this.uuidGenerator.generate.and.returnValue({ value: '42' });
        this.accountStatusProvider.getStatus.and.returnValue(StandardAccountStatus.WaitingConfirmation);
        this.userRepository.exists.and.returnValue(false);
        this.userRepository.addUser.and.returnValue();
        // WHEN
        const account = await this.creationManager.createAccount({
          credentials: {
            login: 'odile.deray',
            password: '123456'
          },
          profile: {
            firstname: 'Odile',
            lastname: 'DERAY'
          }
        });
        // THEN
        expect(account).toBeDefined();
        expect(account).not.toBeNull();
        expect(account.accountId).toBe('42');
        expect(account.accountStatus).toBe(StandardAccountStatus.WaitingConfirmation);
        expect(account.profile).toEqual({
          firstname: 'Odile',
          lastname: 'DERAY'
        });
      });
    });
  });

  describe(`.createAccount()`, () => {
    describe(`with already used login`, () => {
      it(`fails indicating that login is already used`, async () => {
        // GIVEN
        this.uuidGenerator.generate.and.returnValue({ value: '42' });
        this.accountStatusProvider.getStatus.and.returnValue(StandardAccountStatus.WaitingConfirmation);
        this.userRepository.exists.and.returnValue(true);
        // WHEN
        try {
          await this.creationManager.createAccount({
            credentials: {
              login: 'odile.deray',
              password: '123456'
            },
            profile: {
              firstname: 'Odile',
              lastname: 'DERAY',
              username: 'odile.deray'
            }
          });
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
});
