const TYPE_PATTERN = /^\[object (\w+)\]$/;
const toString = {}.toString;

export const getType = (value) => TYPE_PATTERN.exec(toString.apply(value))[1];
