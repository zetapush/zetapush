const TYPE_PATTERN = /^\[object (\w+)\]$/;
const { toString } = {};

const stringify = (value: any): string => toString.apply(value);

export const getType = (value: any): string => {
  const [type = ''] = TYPE_PATTERN.exec(stringify(value)) || [];
  return type;
};
