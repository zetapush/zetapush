import {
  AskResetPasswordManager,
  LoginAccountDetailsResetPassword,
  ResetPasswordContext,
  ResetPasswordUrlProvider,
  AskResetPasswordError,
  PendingAskResetPassword,
  ConfirmResetPasswordManagerInjectable
} from '../../api/LostPassword';
import {
  Redirection,
  Account,
  EmailAddressProvider,
  AskResetPasswordAccount,
  PendingAccountConfirmation,
  AccountResetPasswordTemplateVariables
} from '../../api';
import { UserRepository, TokenManager, Token, VariablesProvider, MessageSender, Email } from '../../../common/api';
import { FixedLocationTemplateManagerHelper } from '../../../common/core';

class EmailAskResetPasswordTemplateVariables implements AccountResetPasswordTemplateVariables {
  constructor(private delegate: ResetPasswordContext, public url: string) {}

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

  get askResetPasswordUrl() {
    return this.url;
  }
}

export class EmailAskResetPasswordManager implements AskResetPasswordManager {
  constructor(
    private userRepository: UserRepository,
    private tokenManager: TokenManager,
    private sender: MessageSender,
    private urlProvider: ResetPasswordUrlProvider,
    private emailAddressProvider: EmailAddressProvider,
    private variablesProvider: VariablesProvider<ResetPasswordContext>,
    private htmlTemplateHelper: FixedLocationTemplateManagerHelper,
    private textTemplateHelper: FixedLocationTemplateManagerHelper
  ) {}

  async askResetPassword(
    accountDetailsResetPassword: LoginAccountDetailsResetPassword
  ): Promise<PendingAskResetPassword> {
    try {
      // Get profile by login
      const account: Account = await this.userRepository.getAccountFromLogin(accountDetailsResetPassword.login);

      // Create token and save it
      const token: Token = await this.tokenManager.generate();
      this.tokenManager.save(token, account.accountId);

      // Send email
      const email = await this.emailAddressProvider.getEmailAddress(account);
      const variables = await this.variablesProvider.getVariables({
        account,
        token: token.value
      });

      const askResetPasswordUrl = await this.urlProvider.getUrl(variables);

      const extendedVariables = new EmailAskResetPasswordTemplateVariables(variables, askResetPasswordUrl);
      let html = await this.htmlTemplateHelper.parse(extendedVariables);
      let text = await this.textTemplateHelper.parse(extendedVariables);

      await this.sender.send(<Email>{
        to: [email],
        body: {
          html: html ? html.toString() : '',
          text: text ? text.toString() : ''
        }
      });
      return {
        account,
        token
      };
    } catch (e) {
      throw new AskResetPasswordError(`Failed to launch reset password process`, accountDetailsResetPassword, e);
    }
  }
}
