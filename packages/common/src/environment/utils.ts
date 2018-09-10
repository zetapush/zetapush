import { MissingConfigurationProperty } from './error';

export const missingKeyError = (key: string, error?: Error) => {
  return error || new MissingConfigurationProperty(`The key '${key}' is not defined`, key);
};

export const missingValueError = (key: string, error?: Error) => {
  return (
    error || new MissingConfigurationProperty(`The key '${key}' is defined but the value is undefined or null`, key)
  );
};

export const normalizeDefaultValue = (defaultValue?: any) => {
  return typeof defaultValue === 'undefined' ? null : defaultValue;
};

export const valueOrDefault = (value: any, defaultValue?: any) => {
  const def = normalizeDefaultValue(defaultValue);
  if (typeof value === 'undefined' || value === null) {
    return def;
  }
  return value;
};

export const valueOrThrow = (key: string, value: any, error?: Error) => {
  if (typeof value === 'undefined' || value === null) {
    throw missingValueError(key, error);
  }
  return value;
};
