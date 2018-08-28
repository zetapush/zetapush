// TODO: return promises ?
export interface ConfigurationProperties {
  get<T>(key: string): T | null;
  get<T>(key: string, defaultValue: T): T;
  getOrThrow<T, E extends Error>(key: string, error: E): T;
}
