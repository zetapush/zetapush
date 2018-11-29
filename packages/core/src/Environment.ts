export interface ZetaPushContext {
  getAppName(): string;
  getPlatformUrl(): string;
  getFrontUrl(name?: string): string | null;
  /**
   * Get the base URL of the HTTP server started by any worker.
   *
   * An application may have several workers that are working together.
   * Each worker has a unique name in order to differentiate workers.
   * This name is then used to get the URL of current worker or of another
   * worker.
   *
   * A worker can start several HTTP servers. Some ZetaPush modules
   * automatically ship an HTTP server in order to expose some URLs
   * on HTTP. An HTTP server can also be started by a developer.
   * So there are two different URLs for one worker.
   *
   * The URLs vary according to where the worker is run.
   * For example, if there is a worker with a ZetaPush module that exposes
   * HTTP URLs and some code to start a custom HTTP server:
   * - running a worker locally will start two HTTP servers on two different ports.
   *   The URLs will then be something like http://localhost:<port1> and http://localhost:<port2>
   * - running a worker in ZetaPush cloud will also start two HTTP servers on tow different ports.
   *   But the ports are not directly exposed on the Internet. For scalability and high availability,
   *   there is an exposed load-balancer and router in front. The both URLs will point to that load-balancer
   *   and will route according to URL. The URLs will then be something like
   *   http://<load-balancer-url>/@zetapush for ZetaPush HTTP server and http://<load-balancer>/
   *
   * @param name The name of the worker in your whole application.
   * If no name is provided, the current worker is used.
   * @param zetapushInternalServer Get the URL for ZetaPush HTTP server if true,
   * get the URL of the custom HTTP server if false.
   * By default, it returns the URL of the custom HTTP server
   */
  getWorkerUrl(name?: string, zetapushInternalServer?: boolean): string | null;
  /**
   * Get the port of the HTTP server that is started for ZetaPush modules in this worker.
   */
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
  getWorkerUrl(name?: string, zetapushInternalServer?: boolean): string | null {
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
