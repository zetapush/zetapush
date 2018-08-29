import { ZetaPushContext, Loadable } from '@zetapush/core';
import { ResolvedConfig } from '../common-types';
import { fetch } from '../utils/network';
import { ContextStateError, ContextLoadError } from './context';
import { IllegalStateError } from '../error';

interface ContextUrls {
  urls: string[];
}

interface FrontContext extends ContextUrls {}
interface WorkerContext extends ContextUrls {}

interface ContextIndexedByName<T> {
  [name: string]: T;
}

interface RewritedContext {
  fronts: ContextIndexedByName<FrontContext>;
  workers: ContextIndexedByName<WorkerContext>;
}

export class HttpZetaPushContext implements ZetaPushContext, Loadable {
  private context?: RewritedContext;
  constructor(private config: ResolvedConfig) {}

  async load(): Promise<void> {
    try {
      const liveStatus = await fetch({
        config: this.config,
        method: 'GET',
        pathname: `orga/business/live/${this.config.appName}`,
        debugName: 'ZetaPushContext'
      });
      this.context = this.rewrite(liveStatus);
    } catch (e) {
      throw new ContextLoadError(`Failed to load context through HTTP`, e);
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

  getFrontUrl(name?: string): string {
    this.checkLoaded();
    return this.getUrl('front', this.context!.fronts);
  }

  getWorkerUrl(name?: string): string {
    this.checkLoaded();
    return this.getUrl('worker', this.context!.workers);
  }

  private getUrl(which: string, base: ContextIndexedByName<FrontContext>, name?: string) {
    if (name) {
      return this.getBestUrl(base[name].urls);
    }
    return this.getBestUrl(this.getDefault(which, base).urls);
  }

  private getDefault(which: string, base: ContextIndexedByName<WorkerContext>): ContextUrls {
    for (let name in base) {
      return base[name];
    }
    throw new IllegalStateError(`Can't determine default ${which} from ZetaPush context`);
  }

  private getBestUrl(urls: string[]) {
    // FIXME: that sucks !!
    return urls[urls.length - 1];
  }

  private checkLoaded() {
    if (!this.context) {
      throw new ContextStateError(
        `You are trying to get a value from ZetaPush context but the context has not been loaded yet`
      );
    }
  }

  private rewrite(liveStatus: any) {
    const nodes = Object.values(liveStatus.nodes);
    const rawFronts = nodes.reduce((reduced, node: any) => {
      const contexts = node.liveData['jetty.local.static.files.contexts'] || [];
      return {
        ...reduced,
        ...contexts.reduce((acc: any, context: any) => {
          acc[context.name] = context.urls;
          return acc;
        }, {})
      };
    }, {});
    const fronts: ContextIndexedByName<FrontContext> = {};
    const workers: ContextIndexedByName<WorkerContext> = {};
    for (let name in rawFronts) {
      fronts[name] = {
        urls: (<any>rawFronts)[name].urls
      };
      workers[name] = {
        urls: (<any>rawFronts)[name].urls // FIXME: retrieve worker urls from platform
      };
    }
    // FIXME: how to handle local development ? Provide localhost:3000 and localhost:2999 ?
    return {
      fronts,
      workers
    };
  }
}
