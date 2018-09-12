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

export type Context = Readonly<MethodContext>;
