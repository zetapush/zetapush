const { given, autoclean, frontUserAction } = require('@zetapush/testing');

describe(`default StandardUserWorkflow published on cloud`, () => {
  afterEach(async () => {
    await autoclean(this);
  });

  /**
   * Nominal case with :
   *  - Create account
   *  - Valid the account
   *  - User connection
   */
  describe(`used by front application`, () => {
    describe(`that signs up a user and confirms its account`, () => {
      beforeEach(async () => {
        await given()
          /**/ .credentials()
          /*  */ .fromEnv()
          /*  */ .and()
          /**/ .project()
          /*  */ .template()
          /*    */ .sourceDir('default-standard-user-workflow')
          /*    */ .and()
          /*  */ .and()
          /**/ .worker()
          /*  */ .pushed()
          /*  */ .and()
          /**/ .apply(this);
      });

      fit(
        `allows connection of the user`,
        async () => {
          await frontUserAction(`Create the user account on the application`, this, async (api) => {
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

          await frontUserAction(`Confirm the user account`, this, async (api) => {
            try {
              await api.confirm(pendingConfirmation, 'user');
            } catch (e) {
              fail(`confirmation of account failed with ${e}`);
            }
          });

          try {
            await frontUserAction(`The user connects himself on the application`, this, async (api, client) => {}, {
              login: 'login',
              password: 'password'
            });
          } catch (e) {
            fail(`connection failed with ${e}`);
          }
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
            /**/ .apply(this);

          await frontUserAction(`Create the user account on the application`, this, async (api) => {
            const userAccount = {
              login: 'login',
              password: 'password',
              firstname: 'Firstname',
              lastname: 'Lastname',
              email: 'firstname.lastname@yopmail.com'
            };

            resultOfSignUp = await api.signup(
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
            await frontUserAction(`Connection of the user on the application`, this, async (api, client) => {}, {
              login: 'login',
              password: 'password'
            });
          } catch (e) {
            expect(e).toEqual('403::Handshake denied');
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
            /**/ .apply(this);

          await frontUserAction(`Create the user account on the application`, this, async (api) => {
            const userAccount = {
              login: 'login',
              password: 'password',
              firstname: 'Firstname',
              lastname: 'Lastname',
              email: 'firstname.lastname@yopmail.com'
            };

            resultOfSignUp = await api.signup(
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

            expect(resultOfSignUp.createdAccount.accountId).toBeDefined();
            expect(resultOfSignUp.createdAccount.accountStatus).toEqual('WAITING_FOR_CONFIRMATION');
            expect(resultOfSignUp.createdAccount.profile).toEqual({
              firstname: 'Firstname',
              lastname: 'Lastname',
              email: 'firstname.lastname@yopmail.com'
            });
            expect(resultOfSignUp.token.original.value).toBeDefined();
          });

          await frontUserAction(`Validate the user account`, this, async (api) => {
            resultOfConfirm = await api.confirm(resultOfSignUp, 'user');
          });

          try {
            await frontUserAction(`Connection of the user on the application`, this, async (api, client) => {}, {
              login: 'login',
              password: 'wrong-password'
            });
          } catch (e) {
            expect(e).toEqual('403::Handshake denied');
          }
        },
        60 * 1000 * 10
      );
    });
  });
});
