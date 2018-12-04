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
      /*     */ .sourceDir('several-parameters')
      /*     */ .and()
      /*   */ .and()
      /**/ .worker()
      /*   */ .up()
      /*   */ .and()
      /**/ .apply(this);
  });

  it(
    `with one parameter`,
    async () => {
      await frontAction(this)
        .name('call API method with one string parameter')
        .execute(async (api) => {
          expect(await api.oneStringParam('foo')).toEqual({ param1: 'foo' });
        });

      await frontAction(this)
        .name('call API method with one number parameter')
        .execute(async (api) => {
          expect(await api.oneNumberParam(3)).toEqual({ param1: 3 });
        });

      await frontAction(this)
        .name('call API method with one object parameter')
        .execute(async (api) => {
          expect(await api.oneObjectParam({ hello: 'World' })).toEqual({ param1: { hello: 'World' } });
        });

      await frontAction(this)
        .name('call API method with one array parameter')
        .execute(async (api) => {
          expect(await api.oneArrayParam([1, 2, 3])).toEqual({ param1: [1, 2, 3] });
        });
    },
    60 * 1000 * 10
  );

  it(
    `with two parameters`,
    async () => {
      await frontAction(this)
        .name('call API method with two string parameters')
        .execute(async (api) => {
          expect(await api.twoStringParams('foo', 'bar')).toEqual({ param1: 'foo', param2: 'bar' });
        });

      await frontAction(this)
        .name('call API method with two number parameters')
        .execute(async (api) => {
          expect(await api.twoNumberParams(3, 4)).toEqual({ param1: 3, param2: 4 });
        });

      await frontAction(this)
        .name('call API method with two object parameters')
        .execute(async (api) => {
          expect(await api.twoObjectParams({ hello: 'World' }, { foo: 'bar' })).toEqual({
            param1: { hello: 'World' },
            param2: { foo: 'bar' }
          });
        });

      await frontAction(this)
        .name('call API method with two array parameters')
        .execute(async (api) => {
          expect(await api.twoArrayParams([1, 2, 3], [4, 5, 6])).toEqual({ param1: [1, 2, 3], param2: [4, 5, 6] });
        });
    },
    60 * 1000 * 10
  );

  it(
    `with mixed parameters`,
    async () => {
      await frontAction(this)
        .name('call API method with mixed parameters')
        .execute(async (api) => {
          expect(await api.mixedParams('foo', 4, { hello: 'World' }, [4, 5, 6])).toEqual({
            param1: 'foo',
            param2: 4,
            param3: { hello: 'World' },
            param4: [4, 5, 6]
          });
        });
    },
    60 * 1000 * 10
  );

  it(
    `with mixed parameters`,
    async () => {
      await frontAction(this)
        .name('call API method with rest parameter alone')
        .execute(async (api) => {
          expect(await api.restParamAlone('foo', 4, { hello: 'World' }, [4, 5, 6])).toEqual({
            rest: ['foo', 4, { hello: 'World' }, [4, 5, 6]]
          });
        });

      await frontAction(this)
        .name('call API method with rest parameter')
        .execute(async (api) => {
          expect(await api.restParam('foo', 4, { hello: 'World' }, [4, 5, 6])).toEqual({
            param1: 'foo',
            rest: [4, { hello: 'World' }, [4, 5, 6]]
          });
        });
    },
    60 * 1000 * 10
  );
});
