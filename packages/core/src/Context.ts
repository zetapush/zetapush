export type ContextLoggerMethod = (...messages: any[]) => void;

export interface ContextLogger {
  trace: ContextLoggerMethod;
  debug: ContextLoggerMethod;
  info: ContextLoggerMethod;
  warn: ContextLoggerMethod;
  error: ContextLoggerMethod;
}

export interface MethodContext {
  contextId?: string;
  owner: string;
  logger: Readonly<ContextLogger>;
}

export type RequestContext = Readonly<MethodContext>;

/**
 * Indicates that a custom cloud service is using the
 * "magical" RequestContext injection.
 *
 * RequestContext is a handy feature that provide you information
 * about the current execution context. Every cloud function
 * has the current call context:
 * - a unique identifier that identifies the cloud function call
 * - a reference to a useful logger that automatically provides information about
 * current call context
 */
export interface RequestContextAware {
  /**
   * RequestContext is a handy feature that provide you information
   * about the current execution context. Every cloud function
   * has a call context. The requestContext provides information
   * for the current call:
   * - a unique identifier that identifies the cloud function call
   * - a reference to a useful logger that automatically provides information about
   * current call context
   *
   * Between each call of a cloud function, a new reqestContext is provided.
   */
  requestContext: RequestContext;
}
