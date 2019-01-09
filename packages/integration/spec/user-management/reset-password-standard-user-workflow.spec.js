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
   *  - Reset the password
   */
  const appDir = 'default-standard-user-workflow';

  describe(`Nominal case with correct process`, () => {
    describe(`Run version`, () => {
      it(
        `The user should has a new password at the end of the process`,
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
            /*       */ .and()
            /*     */ .module('@zetapush/cli')
            /*       */ .and()
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
            .name(`Reset the password`)
            .api()
            /**/ .namespace('user')
            /**/ .and()
            .execute(async (api) => {
              try {
                const pendingAskResetPassword = await api.askResetPassword({ login: 'login' });
                await api.confirmResetPassword({
                  token: pendingAskResetPassword.token,
                  firstPassword: 'pwd',
                  secondPassword: 'pwd'
                });
              } catch (e) {
                console.log('Failed to reset password', e);
              }
            });

          try {
            await frontAction(`The user connects himself on the application`, this, async (api, client) => {}, {
              login: 'login',
              password: 'pwd'
            });
          } catch (e) {
            fail(`connection failed with ${e}`);
          }
        },
        60 * 1000 * 10
      );
    });
    describe(`Pushed version`, () => {
      beforeEach(async () => {
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
          /*  */ .pushed()
          /*  */ .and()
          /**/ .apply(this);
      });

      it(
        `allows connection of the user`,
        async () => {
          await frontAction(`Create the user account on the application`, this, async (api) => {
            const userAccount = {
              login: 'login',
              password: 'password',
              firstname: 'Firstname',
              lastname: 'Lastname',
              email: 'firstname.lastname@yopmail.com'
            };

            const pendingConfirmation = await api.signup(
              {
                credentials: {
                  login: userAccount.login,
                  password: userAccount.password
                },
                profile: {
                  firstname: userAccount.firstname,
                  lastname: userAccount.lastname,
                  email: userAccount.email
                }
              },
              'user'
            );

            expect(pendingConfirmation.createdAccount.accountId).toBeDefined();
            expect(pendingConfirmation.createdAccount.accountStatus).toEqual('WAITING_FOR_CONFIRMATION');
            expect(pendingConfirmation.createdAccount.profile).toEqual({
              firstname: 'Firstname',
              lastname: 'Lastname',
              email: 'firstname.lastname@yopmail.com'
            });
            expect(pendingConfirmation.token.original.value).toBeDefined();
            expect(pendingConfirmation.token.expires).toBeDefined();
            expect(pendingConfirmation.token.expires).toBeGreaterThan(Date().now());
          });

          await frontAction(`Confirm the user account`, this, async (api) => {
            try {
              await api.confirm(pendingConfirmation, 'user');
            } catch (e) {
              fail(`confirmation of account failed with ${e}`);
            }
          });

          await frontAction(this)
            .name(`Reset the password`)
            .api()
            /**/ .namespace('user')
            /**/ .and()
            .execute(async (api) => {
              try {
                const pendingAskResetPassword = await api.askResetPassword({ login: 'login' });
                await api.confirmResetPassword({
                  token: pendingAskResetPassword.token,
                  firstPassword: 'pwd',
                  secondPassword: 'pwd'
                });
              } catch (e) {
                console.log('Failed to reset password', e);
              }
            });

          try {
            await frontAction(`The user connects himself on the application`, this, async (api, client) => {}, {
              login: 'login',
              password: 'pwd'
            });
          } catch (e) {
            fail(`connection failed with ${e}`);
          }
        },
        60 * 1000 * 10
      );
    });
  });
});
