import { ZetaPushContext } from '@zetapush/core';
import { ResolvedConfig } from '../common-types';
import { LocalServerRegistry, ServerType, ServerInfo } from '../utils/server-registry';
import { trace } from '../utils/log';
import { ZETAPUSH_HTTP_SERVER } from './context';

export const defaultLocalUrlProvider = (info: ServerInfo) => `http://localhost:${info.port}`;

export class LocalServerRegistryZetaPushContext implements ZetaPushContext {
  constructor(
    private config: ResolvedConfig,
    private registry: LocalServerRegistry,
    private urlProvider = defaultLocalUrlProvider
  ) {}

  getAppName(): string {
    return this.config.appName;
  }

  getPlatformUrl(): string {
    return this.config.platformUrl;
  }

  getFrontUrl(name?: string | undefined): string | null {
    return this.getUrl(ServerType.FRONT, name);
  }

  getWorkerUrl(name?: string | undefined, zetapushInternalServer?: boolean): string | null {
    if (zetapushInternalServer) {
      return this.getUrl(ServerType.WORKER, ZETAPUSH_HTTP_SERVER);
    }
    return this.getUrl(ServerType.WORKER, name);
  }

  getLocalZetaPushHttpPort(): number | null {
    const info = this.registry.getServerInfo(ZETAPUSH_HTTP_SERVER);
    return info ? info.port : null;
  }

  private getUrl(which: ServerType, name?: string) {
    if (name) {
      return this.getBestUrl(this.registry.getServerInfo(name));
    }
    return this.getBestUrl(this.getDefault(which));
  }

  private getDefault(which: ServerType): ServerInfo | null {
    const defaultContext = this.registry.getServerInfo(ServerType.defaultName(which));
    if (defaultContext) {
      return defaultContext;
    }
    trace(`No default ${which} from ZetaPush context`);
    return null;
  }

  private getBestUrl(info: ServerInfo | null): string | null {
    if (!info) {
      return null;
    }
    return this.urlProvider(info);
  }
}
