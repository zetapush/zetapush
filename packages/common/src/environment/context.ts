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

export const defaultZetaPushContextFactory = async (config: ResolvedConfig) => {
  const context = new HttpZetaPushContext(config);
  await load([context]);
  return context;
};
