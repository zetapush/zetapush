import { ZetaPushContext, Loadable } from '@zetapush/core';
import { ResolvedConfig } from '../common-types';
import { HttpZetaPushContext } from './http-context';
import { BaseError } from '../error';

export class ContextError extends BaseError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class ContextStateError extends ContextError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class ContextLoadError extends ContextError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class ContextReloadError extends ContextError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class MissingContextValue extends ContextError {
  constructor(message: string, public key: string, cause?: Error) {
    super(message, cause);
  }
}

const load = async (delegates: ZetaPushContext[]) => {
  for (let delegate of delegates) {
    const loadable = <any>delegate;
    if (loadable.load && (await loadable.canLoad())) {
      await loadable.load();
    }
  }
};

export class FakeZetaPushContext implements ZetaPushContext {
  constructor(private config: ResolvedConfig) {}

  getAppName(): string {
    return this.config.appName;
  }

  getPlatformUrl(): string {
    return this.config.platformUrl;
  }

  getFrontUrl(name?: string | undefined): string {
    throw new Error('getFrontUrl not implemented.');
  }

  getWorkerUrl(name?: string | undefined): string {
    throw new Error('getWorkerUrl not implemented.');
  }
}

export const defaultZetaPushContextFactory = async (config: ResolvedConfig) => {
  const context = new FakeZetaPushContext(config);
  await load([context]);
  return context;
};
