const clean = (object = {}) =>
  Object.entries(object)
    .filter(([property, value]) => Boolean(value))
    .reduce(
      cleaned,
      ([property, value]) => ({
        ...cleaned,
        [property]: value,
      }),
      {},
    );

export const merge = (base, overrides) => ({
  ...base,
  ...clean(overrides),
});
