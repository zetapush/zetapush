type ContextLoggerMethod = (...messages: any[]) => void;

interface ContextLogger {
  trace: ContextLoggerMethod;
  debug: ContextLoggerMethod;
  info: ContextLoggerMethod;
  warn: ContextLoggerMethod;
  error: ContextLoggerMethod;
}

interface MethodContext {
  id?: string;
  owner: string;
  logger: Readonly<ContextLogger>;
}

export type Context = Readonly<MethodContext>;
