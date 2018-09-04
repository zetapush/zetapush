export interface ZetaPushContext {
  getAppName(): string;
  getPlatformUrl(): string;
  getFrontUrl(name?: string): string;
  getWorkerUrl(name?: string): string;
}

export interface ConfigurationProperties {
  has(key: string): boolean;
  get<T>(key: string): T | null;
  get<T>(key: string, defaultValue: T): T;
  getOrThrow<T, E extends Error>(key: string, error?: E): T;
}

export interface Loadable {
  load(): Promise<void>;
  canLoad(): Promise<boolean>;
}
export interface Reloadable {
  reload(): Promise<void>;
  canReload(): Promise<boolean>;
}

export interface Environment {
  name: string;
  context: ZetaPushContext;
  properties: ConfigurationProperties;
  variables: {
    [name: string]: string | undefined;
  };
}

// Tokens used for DI
export abstract class Environment {}
export abstract class ConfigurationProperties {}
export abstract class ZetaPushContext {}
