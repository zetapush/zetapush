type LogContextMethod = (...messages: any[]) => void;

interface MethodContext {
  owner: string;
  trace: LogContextMethod;
  debug: LogContextMethod;
  info: LogContextMethod;
  warn: LogContextMethod;
  error: LogContextMethod;
}

export type Context = Readonly<MethodContext>;
