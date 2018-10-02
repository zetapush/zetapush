import { ConfirmationUrlProvider, AccountConfirmationContext } from '../../../api/Confirmation';

export class StaticConfirmationUrlProvider implements ConfirmationUrlProvider {
  constructor(protected url: string) {}

  async getUrl(context: AccountConfirmationContext): Promise<string> {
    return this.url;
  }
}
