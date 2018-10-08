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

export interface RuntimeContextUrls {
  [name: string]: string;
}

export interface FrontRuntimeContext {
  urls: RuntimeContextUrls;
  port: number;
}
export interface WorkerRuntimeContext {
  urls: RuntimeContextUrls;
  port: number;
}

export interface ContextIndexedByName<T> {
  [name: string]: T;
}

export interface RuntimeContext {
  fronts: ContextIndexedByName<FrontRuntimeContext>;
  workers: ContextIndexedByName<WorkerRuntimeContext>;
}

export enum StandardUrlNames {
  CANONICAL = 'CANONICAL',
  USER_FRIENDLY = 'USER_FRIENDLY'
}
