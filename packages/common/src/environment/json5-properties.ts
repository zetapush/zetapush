import * as json5 from 'json5';
import { ConfigurationProperties, Reloadable, Loadable } from '@zetapush/core';
import { ConfigurationReloadError, ConfigurationFileLoadError, ConfigurationStateError } from './properties';
import { readFileSync, existsSync } from 'fs';
import { PropertyAccessorWrapper } from './accessor';
import { missingKeyError, valueOrDefault, normalizeDefaultValue, valueOrThrow } from './utils';

// TODO: watch file for automatic reload
export class Json5ConfigurationProperties implements ConfigurationProperties, Loadable, Reloadable {
  private conf?: PropertyAccessorWrapper;
  constructor(private file: string) {}

  async load(): Promise<void> {
    try {
      const content = readFileSync(this.file).toString();
      this.conf = new PropertyAccessorWrapper(json5.parse(content));
    } catch (e) {
      throw new ConfigurationFileLoadError(`Failed to load configuration for ${this.file}`, e);
    }
  }

  async canLoad(): Promise<boolean> {
    return existsSync(this.file);
  }

  async reload(): Promise<void> {
    try {
      await this.load();
    } catch (e) {
      throw new ConfigurationReloadError(`Failed to reload configuration for ${this.file}`, e);
    }
  }
  async canReload(): Promise<boolean> {
    return await this.canLoad();
  }

  has(key: string): boolean {
    if (!this.conf) {
      throw new ConfigurationStateError(
        `You are trying to get a configuration property value but the configuration file has not been loaded yet`
      );
    }
    return this.conf.has(key);
  }

  get<T>(key: string): T | null;
  get<T>(key: string, defaultValue: T): T;
  get(key: any, defaultValue?: any) {
    if (!this.conf) {
      throw new ConfigurationStateError(
        `You are trying to get a configuration property value but the configuration file has not been loaded yet`
      );
    }
    if (this.conf.has(key)) {
      return valueOrDefault(this.conf.get(key), defaultValue);
    } else {
      return normalizeDefaultValue(defaultValue);
    }
  }

  getOrThrow<T, E extends Error>(key: string, error?: E): T {
    if (!this.conf) {
      throw new ConfigurationStateError(
        `You are trying to get a configuration property value but the configuration file has not been loaded yet`
      );
    }
    if (this.conf.has(key)) {
      return valueOrThrow(key, this.conf.get(key), error);
    } else {
      throw missingKeyError(key, error);
    }
  }
}
