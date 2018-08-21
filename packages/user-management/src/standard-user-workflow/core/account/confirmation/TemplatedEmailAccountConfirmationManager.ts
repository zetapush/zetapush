import {
  AccountConfirmationManager,
  PendingAccountConfirmation,
  Account,
  ConfirmedAccount,
  EmailAddressProvider
} from '../../../../standard-user-workflow/api';
import { MessageSender, Email, VariablesProvider } from '../../../../common/api';
import { FixedLocationTemplateManagerHelper } from '../../../../common/core/template/FixedLocationTemplateManagerHelper';
import { AccountConfirmationError, SendTokenError } from '../../exceptions/AccountConfirmationError';

export class TemplatedEmailAccountConfirmationManager implements AccountConfirmationManager {
  constructor(
    private delegate: AccountConfirmationManager,
    private emailAddressProvider: EmailAddressProvider,
    private sender: MessageSender,
    private variablesProvider: VariablesProvider,
    private htmlTemplateHelper: FixedLocationTemplateManagerHelper,
    private textTemplateHelper: FixedLocationTemplateManagerHelper
  ) {}

  async askConfirmation(accountToConfirm: Account): Promise<PendingAccountConfirmation> {
    try {
      const confirmation = await this.delegate.askConfirmation(accountToConfirm);
      const email = await this.emailAddressProvider.getEmailAddress(accountToConfirm);
      const variables = await this.variablesProvider.getVariables({
        account: confirmation.createdAccount,
        token: confirmation.token
      });
      let html = await this.htmlTemplateHelper.parse(variables);
      let text = await this.textTemplateHelper.parse(variables);

      await this.sender.send(<Email>{
        to: [email],
        body: {
          html: html,
          text: text
        }
      });
      return confirmation;
    } catch (e) {
      throw new SendTokenError(`Failed to send email with confirmation link`, accountToConfirm, e);
    }
  }

  confirm(confirmation: PendingAccountConfirmation): Promise<ConfirmedAccount> {
    return this.delegate.confirm(confirmation);
  }
}
