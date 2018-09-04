// ZetaPush modules
import { trace, fetch, todo } from '@zetapush/common';
// Project modules
import { ErrorAnalyzer, ErrorContextToAnalyze, ExitCode } from './error-analyzer';

export class AccessDeniedIssueAnalyzer extends ErrorAnalyzer {
  hasDeveloperLogin(err: ErrorContextToAnalyze) {
    return err.config && err.config.developerLogin;
  }

  hasDeveloperPassword(err: ErrorContextToAnalyze) {
    return err.config && err.config.developerPassword;
  }

  hasAppName(err: ErrorContextToAnalyze) {
    return err.config && err.config.appName;
  }

  async isDeveloperAccountExists(config: any) {
    try {
      await fetch({
        config,
        method: 'POST',
        pathname: '/auth/login',
        body: JSON.stringify({
          username: config.developerLogin,
          password: config.developerPassword
        }),
        debugName: 'isDeveloperAccountExists'
      });
      return true;
    } catch (e) {
      trace('login failed', e);
      return false;
    }
  }

  async isAppExistsForOrga(config: any) {
    try {
      const { content } = await fetch({
        config,
        pathname: '/orga/business/list',
        debugName: 'isAppExistsForOrga'
      });
      return content.filter((app: any) => app.businessId == config.appName).length > 0;
    } catch (e) {
      trace('get apps for orga failed', e);
      return false;
    }
  }

  isAccountNotConfirmed(err: ErrorContextToAnalyze) {
    return err.body && err.body.context && err.body.context && err.body.context.reason == 'ACCOUNT_DISABLED';
  }

  async getError(err: ErrorContextToAnalyze) {
    if (err.statusCode != 403 && err.code != 'CONFIG_MISSING_REQUIRED_INFO') {
      trace('not access denied error and not no config');
      return null;
    }
    trace('access denied', err);
    if (!this.hasDeveloperLogin(err)) {
      trace('no developer login');
      return { code: ExitCode.ACCOUNT_01 };
    }
    if (!this.hasDeveloperPassword(err)) {
      trace('no developer password');
      return { code: ExitCode.ACCOUNT_02 };
    }
    if (this.isAccountNotConfirmed(err)) {
      trace('account not validated');
      return { code: ExitCode.ACCOUNT_05 };
    }
    if (!(await this.isDeveloperAccountExists(err.config))) {
      trace("account doesn't exists");
      return { code: ExitCode.ACCOUNT_03 };
    }
    if (!this.hasAppName(err)) {
      trace('no app name');
      return { code: ExitCode.ACCOUNT_04 };
    }
    if (!(await this.isAppExistsForOrga(err.config))) {
      trace("account exists but application doesn't belong to the account");
      return { code: ExitCode.ACCOUNT_06 };
    }
    // TODO: not allowed to push (missing authorization for orga)
    todo('other forbidden reason');
    return null;
  }
}
