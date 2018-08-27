export interface ZetaPushContext {
  getFrontUrl(name?: string): string;
  getWorkerUrl(name?: string): string;
}

export interface ConfigurationProperties {
  has(key: string): boolean;
  get<T>(key: string): T | null;
  get<T>(key: string, defaultValue: T): T;
  getOrThrow<T, E extends Error>(key: string, error: E): T;
}

export interface Environment {
  name: string;
  context: ZetaPushContext;
  properties: ConfigurationProperties;
  variables: {
    [name: string]: string;
  };
}
