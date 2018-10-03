import { ConfirmationUrlProvider, AccountConfirmationContext } from '../../../api/Confirmation';

export class FuncConfirmationUrlProvider implements ConfirmationUrlProvider {
  constructor(protected func: (context: AccountConfirmationContext) => Promise<string>) {}

  async getUrl(context: AccountConfirmationContext): Promise<string> {
    return await this.func(context);
  }
}
