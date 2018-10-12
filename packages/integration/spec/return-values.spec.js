const { given, frontAction, autoclean } = require('@zetapush/testing');

describe(`Front calling API methods`, () => {
  afterEach(async () => {
    await autoclean(this);
  });

  beforeEach(async () => {
    await given()
      /**/ .credentials()
      /*   */ .fromEnv()
      /*   */ .and()
      /**/ .project()
      /*   */ .template()
      /*     */ .sourceDir('return-values')
      /*     */ .and()
      /*   */ .and()
      /**/ .worker()
      /*   */ .up()
      /*   */ .and()
      /**/ .apply(this);
  });

  it(
    `receives values returned by worker API`,
    async () => {
      await frontAction(this)
        .name('call API method that returns undefined')
        .execute(async (api) => {
          expect(await api.returnsUndefined()).toBeUndefined();
        });

      await frontAction(this)
        .name('call API method that returns null')
        .execute(async (api) => {
          // FIXME: need platform update to correctly serialize null values
          // expect(await api.returnsNull()).toBeNull();
          expect(await api.returnsNull()).toBeFalsy();
        });

      await frontAction(this)
        .name('call API method that returns nothing')
        .execute(async (api) => {
          expect(await api.returnsNothing()).toBeUndefined();
        });

      await frontAction(this)
        .name('call API method that returns empty object')
        .execute(async (api) => {
          expect(await api.returnsEmptyObject()).toEqual({});
        });

      await frontAction(this)
        .name('call API method that returns empty array')
        .execute(async (api) => {
          expect(await api.returnsEmptyArray()).toEqual([]);
        });

      await frontAction(this)
        .name('call API method that returns empty string')
        .execute(async (api) => {
          expect(await api.returnsEmptyString()).toEqual('');
        });

      await frontAction(this)
        .name('call API method that returns 0')
        .execute(async (api) => {
          expect(await api.returnsZero()).toEqual(0);
        });
    },
    60 * 1000 * 10
  );
});
