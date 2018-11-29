import { ConfigurationProperties, ZetaPushContext } from '@zetapush/core';

export abstract class MockedConfigurationProperties implements ConfigurationProperties {
  has(key: string): boolean {
    throw new Error(
      "MockedConfigurationProperties abstract class can't be used as-is. It is meant to be used in tests with ts-mockito"
    );
  }
  get<T>(key: string): T | null;
  get<T>(key: string, defaultValue: T): T;
  get(key: string, defaultValue?: any) {
    throw new Error(
      "MockedConfigurationProperties abstract class can't be used as-is. It is meant to be used in tests with ts-mockito"
    );
  }
  getOrThrow<T, E extends Error>(key: string, error?: E): T {
    throw new Error(
      "MockedConfigurationProperties abstract class can't be used as-is. It is meant to be used in tests with ts-mockito"
    );
  }
}

export abstract class MockedZetaPushContext implements ZetaPushContext {
  getAppName(): string {
    throw new Error(
      "MockedZetaPushContext abstract class can't be used as-is. It is meant to be used in tests with ts-mockito"
    );
  }
  getPlatformUrl(): string {
    throw new Error(
      "MockedZetaPushContext abstract class can't be used as-is. It is meant to be used in tests with ts-mockito"
    );
  }
  getFrontUrl(name?: string): string | null {
    throw new Error(
      "MockedZetaPushContext abstract class can't be used as-is. It is meant to be used in tests with ts-mockito"
    );
  }
  getWorkerUrl(name?: string, zetapushInternalServer?: boolean): string | null {
    throw new Error(
      "MockedZetaPushContext abstract class can't be used as-is. It is meant to be used in tests with ts-mockito"
    );
  }
  getLocalZetaPushHttpPort(): number | null {
    throw new Error(
      "MockedZetaPushContext abstract class can't be used as-is. It is meant to be used in tests with ts-mockito"
    );
  }
}
