import { MissingConfigurationProperty } from './error';
import { ConfigurationProperties, Loadable } from '@zetapush/core';

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

export const availableOnly = async (all: Array<ConfigurationProperties | null>) => {
  const available = [];
  for (let delegate of all) {
    if (!delegate) {
      continue;
    }
    const loadable = <any>delegate;
    if (loadable.canLoad) {
      // if loadable => keep only those that can load
      if (await loadable.canLoad()) {
        available.push(delegate);
      }
    } else {
      // not loadable => keep it
      available.push(delegate);
    }
  }
  return available;
};

export const load = async (delegates: Array<Loadable | any>) => {
  console.log('==> DELEGATE : ', delegates);
  for (let delegate of delegates) {
    console.log('==> one : ', delegate);
    const loadable = <any>delegate;
    console.log('==> loadable.load && (await loadable.canLoad()) : ', loadable.load && (await loadable.canLoad()));
    if (loadable.load && (await loadable.canLoad())) {
      console.log('==> before : ', loadable);
      await loadable.load();
    }
  }
};
