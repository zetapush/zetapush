import 'jasmine';
import { Simple } from '@zetapush/platform-legacy';
import {
  UuidGenerator,
  AccountStatusProvider,
  UsernamePasswordAccountCreationManager,
  UsernameAlreadyUsedError,
  StandardAccountStatus
} from '../../../../src';

describe(`UsernamePasswordAccountCreationManager`, () => {
  const userService = jasmine.createSpyObj('Simple', ['createUser']);
  const uuidGenerator = jasmine.createSpyObj('UuidGenerator', ['generate']);
  const accountStatusProvider = jasmine.createSpyObj('AccountStatusProvider', ['getStatus']);
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
    uuidGenerator.generate.and.returnValue({ value: '42' });
    accountStatusProvider.getStatus.and.returnValue(StandardAccountStatus.WaitingConfirmation);
    // TODO: real value from service
    userService.createUser.and.returnValue();
    // WHEN
    const account = await creationManager.createAccount({
      username: 'odile.deray',
      password: '123456',
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
    uuidGenerator.generate.and.returnValue({ value: '42' });
    accountStatusProvider.getStatus.and.returnValue(StandardAccountStatus.WaitingConfirmation);
    // TODO: real error from service
    const err = new Error('foobar');
    (<any>err).code = 'ACCOUNT_EXISTS';
    userService.createUser.and.throwError(err);
    // WHEN
    try {
      await creationManager.createAccount({
        username: 'odile.deray',
        password: '123456',
        profile: {
          firstname: 'Odile',
          lastname: 'DERAY'
        }
      });
      fail('should have failed with UsernameAlreadyUsedError exception');
    } catch (e) {
      // THEN
      expect(() => {
        throw e;
      }).toThrowError(UsernameAlreadyUsedError, 'Username "odile.deray" is already used');
    }
  });
});
