const { given, autoclean, frontUserAction } = require('@zetapush/testing');

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

          const result = await api.user.signup({
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

          console.log('======>>>>> RESIULT =>', result);
        });

        await frontUserAction(`Validate the user account`, this, async (api) => {
          // TODO: Launch the validation of a user account
        });

        await frontUserAction(`Connection of the user on the application`, this, async (api) => {
          // TODO: Launch the connection of the user
        });
      },
      60 * 1000 * 10
    );
  });
});
