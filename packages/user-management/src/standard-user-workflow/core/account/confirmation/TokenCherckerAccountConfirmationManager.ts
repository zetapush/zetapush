import {
  AccountConfirmationManager,
  Account,
  PendingAccountConfirmation,
  ConfirmedAccount,
  AccountStatusProvider
} from '../../../api';
import { TokenManager, AssociatedValueToToken } from '../../../../common/api';
import {
  NoAccountAssociatedToTokenError,
  UpdateAccountStatusError,
  TokenValidationError
} from '../../../core/exceptions/AccountConfirmationError';
import { UserRepository } from '../../../../common/api/User';

export class TokenCheckerAccountConfirmationManager implements AccountConfirmationManager {
  constructor(
    private tokenManager: TokenManager,
    private userRepository: UserRepository,
    private validatedStatusProvider: AccountStatusProvider
  ) {}

  async askConfirmation(accountToConfirm: Account): Promise<PendingAccountConfirmation> {
    const token = await this.tokenManager.generate();
    // Save the token with the associated account
    await this.tokenManager.save(token, accountToConfirm.accountId);

    return { createdAccount: accountToConfirm, token };
  }

  async confirm(confirmation: PendingAccountConfirmation): Promise<ConfirmedAccount> {
    // TODO: can be reused
    const { token, createdAccount } = confirmation;
    try {
      // Validate the token
      const storeToken = await this.tokenManager.validate(token, this.getMatcher(createdAccount));
      // Get the user from his accountId
      const accountId = storeToken.associatedValue;

      if (accountId) {
        try {
          // generate the new status
          const newStatus = await this.validatedStatusProvider.getStatus();
          // update in database
          await this.userRepository.updateStatus(accountId, newStatus);
          // load the updated profile information from database
          const profile = await this.userRepository.getProfile(accountId);
          return {
            accountId,
            accountStatus: newStatus,
            profile
          } as ConfirmedAccount;
        } catch (e) {
          throw new UpdateAccountStatusError(
            `Failed to update the user account from the user service`,
            createdAccount,
            e
          );
        }
      } else {
        throw new NoAccountAssociatedToTokenError(`This token has no associated account ID`, createdAccount, token);
      }
    } catch (e) {
      throw new TokenValidationError(
        `Failed confirm account because token can't be validated`,
        createdAccount,
        token,
        e
      );
    }
  }

  private getMatcher(createdAccount: Partial<Account>) {
    return async (associatedValue?: AssociatedValueToToken) => {
      // associatedValue is accountToConfirm.accountId
      return associatedValue === createdAccount.accountId;
    };
  }
}
