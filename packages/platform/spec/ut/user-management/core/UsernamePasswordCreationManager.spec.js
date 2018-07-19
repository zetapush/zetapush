const {
  AccountStatus,
  AccountStatusProvider,
  AccountDetailsProvider
} = require('../../../../lib/user-management/standard-user-workflow/api');
const {
  UsernamePasswordAccountCreationManager,
  UsernameAlreadyUsedError
} = require('../../../../lib/user-management/standard-user-workflow/core');
const { UuidGenerator } = require('../../../../lib/common/api');
const { Simple } = require('../../../../lib/authentication');

describe(`UsernamePasswordAccountCreationManager`, () => {
  const userService = jasmine.createSpyObj(Simple, ['createUser']);
  const uuidGenerator = jasmine.createSpyObj(UuidGenerator, ['generate']);
  const accountStatusProvider = jasmine.createSpyObj(AccountStatusProvider, ['getStatus']);
  const creationManager = new UsernamePasswordAccountCreationManager(userService, uuidGenerator, accountStatusProvider);

  beforeEach(() => {});

  it(`configured with
      - uuid = 42
      - account status = 'WAITING_FOR_CONFIRMATION'
      - userService that creates account successfully 
      - no account details provider
     should return a profile with:
      - accountId = 42
      - accountStatus = 'WAITING_FOR_CONFIRMATION'
      - userProfile = {firstname: 'Odile', lastname: 'DERAY'}`, async () => {
    // GIVEN
    uuidGenerator.generate.and.returnValue({ value: 42 });
    accountStatusProvider.getStatus.and.returnValue(AccountStatus.waitingConfirmation);
    // TODO: real value from service
    userService.createUser.and.returnValue();
    // WHEN
    const account = await creationManager.signup({
      username: 'odile.deray',
      password: '123456',
      profile: {
        firstname: 'Odile',
        lastname: 'DERAY'
      }
    });
    // THEN
    expect(account.accountId).toBe(42);
    expect(account.accountStatus).toBe(AccountStatus.waitingConfirmation);
    expect(account.userProfile).toEqual({
      firstname: 'Odile',
      lastname: 'DERAY'
    });
  });

  it(`configured with
      - uuid = 42
      - account status = 'WAITING_FOR_CONFIRMATION'
      - userService that fails due to account already exists
      - no account details provider
     should 
      - throw UsernameAlreadyUsedError`, async () => {
    // GIVEN
    uuidGenerator.generate.and.returnValue({ value: 42 });
    accountStatusProvider.getStatus.and.returnValue(AccountStatus.waitingConfirmation);
    // TODO: real error from service
    const err = new Error('foobar');
    err.code = 'ACCOUNT_EXISTS';
    userService.createUser.and.throwError(err);
    // WHEN
    try {
      await creationManager.signup({
        username: 'odile.deray',
        password: '123456',
        profile: {
          firstname: 'Odile',
          lastname: 'DERAY'
        }
      });
      fail('no exception ');
    } catch (e) {
      // THEN
      expect(() => {
        throw e;
      }).toThrowError(UsernameAlreadyUsedError, 'Username "odile.deray" is already used');
    }
  });
});
