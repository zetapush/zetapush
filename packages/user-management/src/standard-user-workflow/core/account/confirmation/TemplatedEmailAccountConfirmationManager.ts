import {
  AccountConfirmationManager,
  PendingAccountConfirmation,
  Account,
  ConfirmedAccount,
  EmailAddressProvider,
  AccountConfirmationTemplateVariables
} from '../../../../standard-user-workflow/api';
import { MessageSender, Email, VariablesProvider } from '../../../../common/api';
import { FixedLocationTemplateManagerHelper } from '../../../../common/core/template/FixedLocationTemplateManagerHelper';
import { AccountConfirmationError, SendTokenError } from '../../exceptions/AccountConfirmationError';
import { ConfirmationUrlProvider, AccountConfirmationContext } from '../../../api/Confirmation';

class EmailAccountConfirmationTemplateVariables implements AccountConfirmationTemplateVariables {
  constructor(protected delegate: AccountConfirmationContext, public confirmationUrl: string) {}

  get account() {
    return this.delegate.account;
  }

  get token() {
    return this.delegate.token;
  }

  get properties() {
    return this.delegate.properties;
  }

  get zetapushContext() {
    return this.delegate.zetapushContext;
  }
}

export class TemplatedEmailAccountConfirmationManager implements AccountConfirmationManager {
  constructor(
    protected delegate: AccountConfirmationManager,
    protected emailAddressProvider: EmailAddressProvider,
    protected sender: MessageSender,
    protected urlProvider: ConfirmationUrlProvider,
    protected variablesProvider: VariablesProvider<AccountConfirmationContext>,
    protected htmlTemplateHelper: FixedLocationTemplateManagerHelper,
    protected textTemplateHelper: FixedLocationTemplateManagerHelper
  ) {}

  async askConfirmation(accountToConfirm: Account): Promise<PendingAccountConfirmation> {
    try {
      const confirmation = await this.delegate.askConfirmation(accountToConfirm);
      const email = await this.emailAddressProvider.getEmailAddress(accountToConfirm);
      const variables = await this.variablesProvider.getVariables({
        account: confirmation.createdAccount,
        token: confirmation.token
      });
      const confirmationUrl = await this.urlProvider.getUrl(variables);
      const extendedVariables = new EmailAccountConfirmationTemplateVariables(variables, confirmationUrl);
      let html = await this.htmlTemplateHelper.parse(extendedVariables);
      let text = await this.textTemplateHelper.parse(extendedVariables);

      await this.sender.send(<Email>{
        to: [email],
        body: {
          html: html ? html.toString() : '',
          text: text ? text.toString() : ''
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
