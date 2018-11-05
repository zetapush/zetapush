import { ResolvedConfig, ServerClient } from '../common-types';
import { ZetaPushContext, Loadable } from '@zetapush/core';
import {
  ContextStateError,
  ContextLoadError,
  RuntimeContext,
  ContextIndexedByName,
  RuntimeContextUrls,
  StandardUrlNames
} from './context';
import { LocalServerRegistry, ServerType } from '../utils/server-registry';
import { trace } from '../utils/log';

export class PlatformEventContext implements ZetaPushContext, Loadable {
  private context?: RuntimeContext;
  constructor(
    private config: ResolvedConfig,
    private client: ServerClient,
    private queueApi: any,
    private serverRegistry: LocalServerRegistry
  ) {}

  async load(): Promise<void> {
    try {
      await this.client.connect();
      this.context = await this.queueApi.getContext();
      trace('Platform context', this.context);
    } catch (e) {
      throw new ContextLoadError(`Failed to ask ZetaPush context to the platform`, e);
    }
  }

  async canLoad(): Promise<boolean> {
    return true;
  }

  getAppName() {
    return this.config.appName;
  }

  getPlatformUrl() {
    return this.config.platformUrl;
  }

  getFrontUrl(name?: string): string | null {
    this.checkLoaded();
    return this.getUrl(ServerType.FRONT, this.context!.fronts, name);
  }

  getWorkerUrl(name?: string): string | null {
    this.checkLoaded();
    return this.getUrl(ServerType.WORKER, this.context!.workers, name);
  }

  getLocalZetaPushHttpPort(): number | null {
    const info = this.serverRegistry.getServerInfo(ServerType.defaultName(ServerType.WORKER));
    return info ? info.port : null;
  }

  private getUrl(which: ServerType, base: ContextIndexedByName<{ urls: RuntimeContextUrls }>, name?: string) {
    if (name) {
      return this.getBestUrl(base[name]);
    }
    return this.getBestUrl(this.getDefault(which, base));
  }

  private getDefault(
    which: ServerType,
    base: ContextIndexedByName<{ urls: RuntimeContextUrls }>
  ): { urls: RuntimeContextUrls } | null {
    const defaultContext = base[ServerType.defaultName(which)];
    if (defaultContext) {
      return defaultContext;
    }
    trace(`No default ${ServerType.defaultName(which)} from ZetaPush context`);
    return null;
  }

  private getBestUrl(context: { urls: RuntimeContextUrls } | null): string | null {
    if (!context || !context.urls) {
      return null;
    }
    return context.urls[StandardUrlNames.USER_FRIENDLY] || null;
  }

  private checkLoaded() {
    if (!this.context) {
      throw new ContextStateError(
        `You are trying to get a value from ZetaPush context but the context has not been loaded yet`
      );
    }
  }
}
