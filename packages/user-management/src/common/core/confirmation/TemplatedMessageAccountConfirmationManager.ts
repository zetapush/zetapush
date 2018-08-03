import {
  AccountConfirmationManager,
  PendingAccountConfirmation,
  Account,
  ConfirmedAccount,
  EmailAddressProvider
} from '../../../standard-user-workflow/api';
import { Token, TemplateManager, MessageSender, Location, Email, TokenGenerator } from '../../api';
import { UndefinedLocation } from '../resource/NoOpResourceResolver';

export class TemplatedMessageAccountConfirmationManager implements AccountConfirmationManager {
  constructor(
    private tokenGenerator: TokenGenerator,
    private emailAddressProvider: EmailAddressProvider,
    private sender: MessageSender,
    private htmlTemplate?: Location,
    private htmlTemplateManager?: TemplateManager,
    private textTemplate?: Location,
    private textTemplateManager?: TemplateManager
  ) {}

  async askConfirmation(accountToConfirm: Account): Promise<PendingAccountConfirmation> {
    const token = await this.tokenGenerator.generate();
    const email = await this.emailAddressProvider.getEmailAddress(accountToConfirm);
    const variables = {
      account: accountToConfirm,
      token
    };
    let html;
    if (this.htmlTemplateManager && this.htmlTemplate) {
      html = await this.htmlTemplateManager.loadAndParse(this.htmlTemplate, variables);
    }
    let text;
    if (this.textTemplateManager && this.textTemplate) {
      text = await this.textTemplateManager.loadAndParse(this.textTemplate, variables);
    }
    await this.sender.send(<Email>{
      to: [email],
      body: {
        html: html,
        text: text
      }
    });
    return { createdAccountId: accountToConfirm.accountId, token };
  }

  confirm(token: Token): Promise<ConfirmedAccount> {
    throw new Error('Not implemented');
  }
}
