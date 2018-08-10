import {
  AccountConfirmationManager,
  PendingAccountConfirmation,
  Account,
  ConfirmedAccount,
  EmailAddressProvider
} from '../../../standard-user-workflow/api';
import { Token, TemplateManager, MessageSender, Location, Email, TokenManager } from '../../api';
import { NoAccountAssociatedToTokenError } from '../../api/exception/TokenError';
import { FailedRetrieveUserAccount } from '../../../standard-user-workflow/api/exceptions/AccountConfirmationError';
import { Simple } from '@zetapush/platform-legacy';

export class TemplatedMessageAccountConfirmationManager implements AccountConfirmationManager {
  constructor(
    private tokenManager: TokenManager,
    private emailAddressProvider: EmailAddressProvider,
    private sender: MessageSender,
    private userService: Simple,
    private htmlTemplate?: Location,
    private htmlTemplateManager?: TemplateManager,
    private textTemplate?: Location,
    private textTemplateManager?: TemplateManager
  ) {}

  async askConfirmation(accountToConfirm: Account): Promise<PendingAccountConfirmation> {
    const token = await this.tokenManager.generate();
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

    // Save the token with the associated account
    await this.tokenManager.save(token, accountToConfirm.accountId);

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
    return new Promise<ConfirmedAccount>((resolve, reject) => {
      // Validate the token
      this.tokenManager
        .validate(token)
        .then(async (result) => {
          // Get the user from his accountId
          const accountId = result.associatedValue;

          if (accountId) {
            let user;
            try {
              // TODO: Update user account
              user = await this.userService.checkUser({ key: accountId });
              resolve(user as ConfirmedAccount);
            } catch (e) {
              reject(
                new FailedRetrieveUserAccount(`Failed to retrieve the user account from the user service`, accountId)
              );
            }
          } else {
            reject(new NoAccountAssociatedToTokenError(`This token has no associated account ID`, token));
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
