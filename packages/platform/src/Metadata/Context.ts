type ContextLoggerMethod = (...messages: any[]) => void;

interface ContextLogger {
  trace: ContextLoggerMethod;
  debug: ContextLoggerMethod;
  info: ContextLoggerMethod;
  warn: ContextLoggerMethod;
  error: ContextLoggerMethod;
}

interface MethodContext {
  owner: string;
  logger: Readonly<ContextLogger>;
}

export type Context = Readonly<MethodContext>;
