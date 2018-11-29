import { UserRepository, TokenManager } from '../../../common/api';
import {
  ConfirmResetPasswordManager,
  DetailsResetPassword,
  PasswordAreNotIdenticalsError,
  ResetPasswordValidationTokenError,
  ResetPasswordChangerPasswordError,
  ChangerPasswordError
} from '../../api/LostPassword';
import { Account } from '../../api';
import { Simple } from '@zetapush/platform-legacy';

export class ConfirmResetPasswordManagerImpl implements ConfirmResetPasswordManager {
  constructor(private userRepository: UserRepository, private tokenManager: TokenManager, private legacyAuth: Simple) {}

  /**
   * Change the password of the specified user
   * @param accountId accountId of the user we want to change the password
   */
  private async changePassword(accountId: string, password: string) {
    try {
      const login = await this.userRepository.getLoginFromAccountId(accountId);

      // We ask to reset the password, an unique token is returned
      const { token } = await this.legacyAuth.requestReset({
        key: login
      });

      // We change the password using the generated token
      const result = await this.legacyAuth.changePassword({
        token,
        password
      });
    } catch (e) {
      if (e.code === 'NO_ACCOUNT') {
        throw new ChangerPasswordError(`No account found for "${accountId}"`, accountId, e);
      } else {
        throw new ChangerPasswordError(`Failed to change password of "${accountId}"`, accountId, e);
      }
    }
  }

  async confirmResetPassword(detailsResetPassword: DetailsResetPassword): Promise<Account> {
    const { token, firstPassword, secondPassword } = detailsResetPassword;
    let accountId;

    // Check passwords are identicals
    if (firstPassword !== secondPassword) {
      throw new PasswordAreNotIdenticalsError(`The provided passwords are not identicals`, detailsResetPassword);
    }

    // Validate the token
    try {
      const { associatedValue } = await this.tokenManager.validate({ value: token });
      accountId = associatedValue;
    } catch (e) {
      throw new ResetPasswordValidationTokenError(`Failed to validate the provided token`, detailsResetPassword, e);
    }

    // Change the password
    try {
      await this.changePassword(accountId, firstPassword);
    } catch (e) {
      throw new ResetPasswordChangerPasswordError(
        `Failed to change the password with provided details`,
        detailsResetPassword,
        e
      );
    }

    // Return account
    return await this.userRepository.getAccountFromAccountId(accountId);
  }
}
