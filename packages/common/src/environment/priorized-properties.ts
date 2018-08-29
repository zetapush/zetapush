import { ConfigurationProperties } from '@zetapush/core';
import { MissingConfigurationProperty } from './properties';
import { missingKeyError, normalizeDefaultValue, missingValueError } from './utils';

export class PriorizedConfigurationProperties implements ConfigurationProperties {
  private delegates: ConfigurationProperties[];

  constructor(...delegates: ConfigurationProperties[]) {
    this.delegates = delegates;
  }

  has(key: string): boolean {
    for (let delegate of this.delegates) {
      if (delegate.has(key)) {
        return true;
      }
    }
    return false;
  }

  get<T>(key: string): T | null;
  get<T>(key: string, defaultValue: T): T;
  get(key: any, defaultValue?: any) {
    for (let delegate of this.delegates) {
      if (delegate.has(key)) {
        const value = delegate.get(key);
        if (typeof value !== 'undefined' && value !== null) {
          return value;
        }
      }
    }
    return normalizeDefaultValue(defaultValue);
  }

  getOrThrow<T, E extends Error>(key: string, error?: E): T {
    for (let delegate of this.delegates) {
      if (delegate.has(key)) {
        const value = delegate.get(key);
        if (typeof value === 'undefined' || value === null) {
          throw missingValueError(key, error);
        }
        return value as T;
      }
    }
    throw missingKeyError(key, error);
  }
}
