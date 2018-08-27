import 'jasmine';
import { LoginPasswordAuthenticationManager } from '../../../../../src/standard-user-workflow/core/authentication/LoginPasswordAuthenticationManager';

describe(`LoginPasswordAuthenticationManager`, () => {
  beforeEach(() => {
    this.zetaClient = jasmine.createSpyObj('ZetaPushClient', ['connect', 'disconnect', 'getUserId']);
    this.userManager = jasmine.createSpyObj('Simple', ['checkUser']);
    this.authManager = new LoginPasswordAuthenticationManager(this.userManager);
  });

  describe(`authentication`, () => {
    describe(`on valid process`, () => {
      it(`Login an user and should returns his user profile`, async () => {
        // GIVEN
        this.zetaClient.getUserId.and.returnValue('42');
        this.userManager.checkUser.and.returnValue({
          accountId: '5',
          accountStatus: 'active',
          profile: { login: 'odile.deray' }
        });

        // WHEN
        const returnedAccount = await this.authManager.login({ login: 'odile.deray', password: 'password' });

        // THEN
        expect(returnedAccount).toBeDefined();
        expect(returnedAccount).not.toBeNull();
        expect(returnedAccount).toEqual({ accountId: '5', accountStatus: 'active', profile: { login: 'odile.deray' } });
      });
    });
  });

  describe(`authentication`, () => {
    describe(`with bad credentials`, () => {
      it(`Login the user and should returns BAD_CREDENTIALS error`, async () => {});
    });
  });
});
