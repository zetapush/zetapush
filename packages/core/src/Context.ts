type ContextLoggerMethod = (...messages: any[]) => void;

interface ContextLogger {
  trace: ContextLoggerMethod;
  debug: ContextLoggerMethod;
  info: ContextLoggerMethod;
  warn: ContextLoggerMethod;
  error: ContextLoggerMethod;
}

interface MethodContext {
  contextId?: string;
  owner: string;
  logger: Readonly<ContextLogger>;
}

export type Context = Readonly<MethodContext>;
