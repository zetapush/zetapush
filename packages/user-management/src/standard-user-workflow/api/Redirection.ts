export interface Redirection {}

export class HttpUrlRedirection implements Redirection {
  constructor(public url: string, public statusCode: number = 302) {}
}

export interface Action extends Redirection {}

export interface RedirectionProvider<P> {
  getRedirection(context: P): Promise<Redirection>;
}
export abstract class RedirectionProviderInjectable<P> implements RedirectionProvider<P> {
  abstract getRedirection(context: P): Promise<Redirection>;
}
