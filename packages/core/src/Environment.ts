export interface ZetaPushContext {
  getAppName(): string;
  getPlatformUrl(): string;
  getFrontUrl(name?: string): string | null;
  getWorkerUrl(name?: string): string | null;
  getLocalZetaPushHttpPort(): number | null;
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
  readonly name: string;
  readonly context: ZetaPushContext;
  readonly properties: ConfigurationProperties;
  readonly variables: {
    [name: string]: string | undefined;
  };
}

// Tokens used for DI
export abstract class Environment implements Environment {}
export abstract class ConfigurationProperties implements ConfigurationProperties {
  has(key: string): boolean {
    throw new Error(
      "ConfigurationProperties abstract class can't be used as-is. It is meant to be used as dependency injection token"
    );
  }
  get<T>(key: string): T | null;
  get<T>(key: string, defaultValue: T): T;
  get(key: string, defaultValue?: any) {
    throw new Error(
      "ConfigurationProperties abstract class can't be used as-is. It is meant to be used as dependency injection token"
    );
  }
  getOrThrow<T, E extends Error>(key: string, error?: E): T {
    throw new Error(
      "ConfigurationProperties abstract class can't be used as-is. It is meant to be used as dependency injection token"
    );
  }
}
export abstract class ZetaPushContext implements ZetaPushContext {
  getAppName(): string {
    throw new Error(
      "ZetaPushContext abstract class can't be used as-is. It is meant to be used as dependency injection token"
    );
  }
  getPlatformUrl(): string {
    throw new Error(
      "ZetaPushContext abstract class can't be used as-is. It is meant to be used as dependency injection token"
    );
  }
  getFrontUrl(name?: string): string | null {
    throw new Error(
      "ZetaPushContext abstract class can't be used as-is. It is meant to be used as dependency injection token"
    );
  }
  getWorkerUrl(name?: string): string | null {
    throw new Error(
      "ZetaPushContext abstract class can't be used as-is. It is meant to be used as dependency injection token"
    );
  }
  getLocalZetaPushHttpPort(): number | null {
    throw new Error(
      "ZetaPushContext abstract class can't be used as-is. It is meant to be used as dependency injection token"
    );
  }
}
