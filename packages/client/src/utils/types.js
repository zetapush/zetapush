const TYPE_PATTERN = /^\[object (\w+)\]$/;
const { toString } = {};

const stringify = (value) => toString.apply(value);

export const getType = (value) => {
  const [, type = ''] = TYPE_PATTERN.exec(stringify(value)) || [];
  return type;
};
