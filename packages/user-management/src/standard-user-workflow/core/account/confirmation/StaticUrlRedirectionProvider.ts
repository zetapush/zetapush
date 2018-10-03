import { RedirectionProvider, Redirection, HttpUrlRedirection } from '../../../api';

export class StaticUrlRedirectionProvider<P> implements RedirectionProvider<P> {
  constructor(protected url: string) {}

  async getRedirection(context: P): Promise<Redirection> {
    return new HttpUrlRedirection(this.url);
  }
}
