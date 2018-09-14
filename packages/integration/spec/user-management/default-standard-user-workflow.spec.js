const { given, autoclean, frontAction } = require('@zetapush/testing');
const { AccountNotConfirmedError, BadCredentialsError } = require('@zetapush/client');

describe(`As developer with
  - valid account
  - no configured application
  `, () => {
  afterEach(async () => {
    await autoclean(this);
  });

  /**
   * Nominal case with :
   *  - Create account
   *  - Valid the account
   *  - User connection
   */
  const appDir = 'default-standard-user-workflow';

  describe(`Nominal case with correct process`, () => {
    it(
      `The user should be connected at the and of the process`,
      async () => {
        let resultOfSignUp = null;
        await given()
          /**/ .credentials()
          /*  */ .fromEnv()
          /*  */ .and()
          /**/ .project()
          /*  */ .template()
          /*    */ .sourceDir(appDir)
          /*    */ .and()
          /*  */ .and()
          /**/ .worker()
          /*  */ .up()
          /*  */ .and()
          /**/ .npm()
          /*   */ .dependencies()
          /*     */ .module('@zetapush/user-management')
          /*       */ .and()
          /*     */ .module('@zetapush/core')
          /*     */ .and()
          /*     */ .and()
          /*   */ .and()
          /**/ .apply(this);

        await frontAction(this)
          .name(`Create the user account on the application`)
          .api()
          /**/ .namespace('user')
          /**/ .and()
          .execute(async (api) => {
            const userAccount = {
              login: 'login',
              password: 'password',
              firstname: 'Firstname',
              lastname: 'Lastname',
              email: 'firstname.lastname@yopmail.com'
            };

            resultOfSignUp = await api.signup({
              credentials: {
                login: userAccount.login,
                password: userAccount.password
              },
              profile: {
                firstname: userAccount.firstname,
                lastname: userAccount.lastname,
                email: userAccount.email
              }
            });

            expect(resultOfSignUp.createdAccount.accountId).toBeDefined();
            expect(resultOfSignUp.createdAccount.accountStatus).toEqual('WAITING_FOR_CONFIRMATION');
            expect(resultOfSignUp.createdAccount.profile).toEqual({
              firstname: 'Firstname',
              lastname: 'Lastname',
              email: 'firstname.lastname@yopmail.com'
            });
            expect(resultOfSignUp.token.original.value).toBeDefined();
          });

        await frontAction(this)
          .name(`Validate the user account`)
          .api()
          /**/ .namespace('user')
          /**/ .and()
          .execute(async (api) => {
            resultOfConfirm = await api.confirm(resultOfSignUp);
          });

        await frontAction(this)
          .name(`Connection of the user on the application`)
          .loggedAs('login', 'password')
          .execute();
      },
      60 * 1000 * 10
    );
  });

  describe(`Nominal case with no activated account`, () => {
    it(
      `The user can't connect with handshake failed`,
      async () => {
        let resultOfSignUp = null;
        await given()
          /**/ .credentials()
          /*  */ .fromEnv()
          /*  */ .and()
          /**/ .project()
          /*  */ .template()
          /*    */ .sourceDir(appDir)
          /*    */ .and()
          /*  */ .and()
          /**/ .worker()
          /*  */ .up()
          /*  */ .and()
          /**/ .npm()
          /*   */ .dependencies()
          /*     */ .module('@zetapush/user-management')
          /*       */ .and()
          /*     */ .module('@zetapush/core')
          /*     */ .and()
          /*     */ .and()
          /*   */ .and()
          /**/ .apply(this);

        await frontAction(this)
          .name(`Create the user account on the application`)
          .api()
          /**/ .namespace('user')
          /**/ .and()
          .execute(async (api) => {
            const userAccount = {
              login: 'login',
              password: 'password',
              firstname: 'Firstname',
              lastname: 'Lastname',
              email: 'firstname.lastname@yopmail.com'
            };

            resultOfSignUp = await api.signup({
              credentials: {
                login: userAccount.login,
                password: userAccount.password
              },
              profile: {
                firstname: userAccount.firstname,
                lastname: userAccount.lastname,
                email: userAccount.email
              }
            });

            expect(resultOfSignUp.createdAccount.accountId).toBeDefined();
            expect(resultOfSignUp.createdAccount.accountStatus).toEqual('WAITING_FOR_CONFIRMATION');
            expect(resultOfSignUp.createdAccount.profile).toEqual({
              firstname: 'Firstname',
              lastname: 'Lastname',
              email: 'firstname.lastname@yopmail.com'
            });
            expect(resultOfSignUp.token.original.value).toBeDefined();
          });

        try {
          await frontAction(this)
            .name(`Connection of the user on the application`)
            .loggedAs('login', 'password')
            .execute();
        } catch (e) {
          expect(() => {
            throw e;
          }).toThrowError(AccountNotConfirmedError);
        }
      },
      60 * 1000 * 10
    );
  });

  describe(`Nominal case with wrong password`, () => {
    it(
      `The user can't be connected because he has wrong credentials`,
      async () => {
        let resultOfSignUp = null;
        await given()
          /**/ .credentials()
          /*  */ .fromEnv()
          /*  */ .and()
          /**/ .project()
          /*  */ .template()
          /*    */ .sourceDir(appDir)
          /*    */ .and()
          /*  */ .and()
          /**/ .worker()
          /*  */ .up()
          /*  */ .and()
          /**/ .npm()
          /*   */ .dependencies()
          /*     */ .module('@zetapush/user-management')
          /*       */ .and()
          /*     */ .module('@zetapush/core')
          /*     */ .and()
          /*     */ .and()
          /*   */ .and()
          /**/ .apply(this);

        await frontAction(this)
          .name(`Create the user account on the application`)
          .api()
          /**/ .namespace('user')
          /**/ .and()
          .execute(async (api) => {
            const userAccount = {
              login: 'login',
              password: 'password',
              firstname: 'Firstname',
              lastname: 'Lastname',
              email: 'firstname.lastname@yopmail.com'
            };

            resultOfSignUp = await api.signup({
              credentials: {
                login: userAccount.login,
                password: userAccount.password
              },
              profile: {
                firstname: userAccount.firstname,
                lastname: userAccount.lastname,
                email: userAccount.email
              }
            });

            expect(resultOfSignUp.createdAccount.accountId).toBeDefined();
            expect(resultOfSignUp.createdAccount.accountStatus).toEqual('WAITING_FOR_CONFIRMATION');
            expect(resultOfSignUp.createdAccount.profile).toEqual({
              firstname: 'Firstname',
              lastname: 'Lastname',
              email: 'firstname.lastname@yopmail.com'
            });
            expect(resultOfSignUp.token.original.value).toBeDefined();
          });

        await frontAction(this)
          .name(`Validate the user account`)
          .api()
          /**/ .namespace('user')
          /**/ .and()
          .execute(async (api) => {
            resultOfConfirm = await api.confirm(resultOfSignUp);
          });

        try {
          await frontAction(this)
            .name(`Connection of the user on the application`)
            .loggedAs('login', 'wrong-password')
            .api()
            /**/ .namespace('user')
            /**/ .and()
            .execute();
        } catch (e) {
          expect(() => {
            throw e;
          }).toThrowError(BadCredentialsError);
        }
      },
      60 * 1000 * 10
    );
  });
});
