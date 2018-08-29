import { ConfigurationProperties } from '@zetapush/core';
import { MissingConfigurationProperty } from './properties';
import { missingKeyError, valueOrDefault, normalizeDefaultValue, valueOrThrow } from './utils';

export class EnvironmentVariablesConfigurationProperties implements ConfigurationProperties {
  constructor(private env: NodeJS.ProcessEnv = process.env) {}

  has(key: string): boolean {
    return this.convertKey(key) in this.env;
  }

  get<T>(key: string): T | null;
  get<T>(key: string, defaultValue: T): T;
  get(key: any, defaultValue?: any) {
    if (this.has(key)) {
      return valueOrDefault(this.convertValue(this.env[this.convertKey(key)]), defaultValue);
    } else {
      return normalizeDefaultValue(defaultValue);
    }
  }

  getOrThrow<T, E extends Error>(key: string, error?: E): T {
    if (this.has(key)) {
      return valueOrThrow(key, this.convertValue(this.env[this.convertKey(key)]), error);
    } else {
      throw missingKeyError(key, error);
    }
  }

  private convertValue(value?: string): any {
    // TODO: conversion may need to delegate to converters to be more accurate
    if (!value) {
      return value;
    }
    try {
      return JSON.parse(value);
    } catch (e) {
      return value as any;
    }
  }

  private convertKey(key: string): string {
    return key.toUpperCase().replace(/[.]/g, '_');
  }
}
