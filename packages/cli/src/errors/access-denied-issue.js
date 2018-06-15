const { ErrorAnalyzer } = require('./troubleshooting');
const { trace, log, error, info, help } = require('../utils/log');
const { fetch } = require('../utils/network');
const request = require('request');

class AccessDeniedIssueAnalyzer extends ErrorAnalyzer {
  hasDeveloperLogin(err) {
    return err.config && err.config.developerLogin;
  }

  hasDeveloperPassword(err) {
    return err.config && err.config.developerPassword;
  }

  hasAppName(err) {
    return err.config && err.config.appName;
  }

  async isDeveloperAccountExists(config) {
    try {
      const account = await fetch({
        config,
        method: 'POST',
        pathname: '/auth/login',
        body: JSON.stringify({
          username: config.developerLogin,
          password: config.developerPassword,
        }),
      });
      return true;
    } catch (e) {
      trace('login failed', e);
      return false;
    }
  }

  async isAppExistsForOrga(config) {
    try {
      const { content } = await fetch({
        config,
        pathname: '/orga/business/list',
      });
      return (
        content.filter((app) => app.businessId == config.appName).length > 0
      );
    } catch (e) {
      trace('get apps for orga failed', e);
      return false;
    }
  }

  isAccountNotConfirmed(err) {
    return err.body && err.body.contains('ACCOUNT_DISABLED');
  }

  async getError(err) {
    if (err.statusCode != 403 && err.code != 'CONFIG_MISSING_REQUIRED_INFO') {
      trace('not access denied error and not no config');
      return null;
    }
    trace('access denied', err);
    if (!this.hasDeveloperLogin(err)) {
      trace('no developer login');
      return { code: 'ACCOUNT-01' };
    }
    if (!this.hasDeveloperPassword(err)) {
      trace('no developer password');
      return { code: 'ACCOUNT-02' };
    }
    if (!(await this.isDeveloperAccountExists(err.config))) {
      trace("account doesn't exist or account not validated expired");
      return { code: 'ACCOUNT-03' };
    }
    if(this.isAccountNotConfirmed(err)) {
      trace('account not validated');
      return { code: 'ACCOUNT-05' };
    }
    if (!this.hasAppName(err)) {
      trace('no app name');
      return { code: 'ACCOUNT-04' };
    }
    if (!(await this.isAppExistsForOrga(err.config))) {
      trace("account exists but application doesn't belong to the account");
      return { code: 'ACCOUNT-06' };
    }
    // TODO: not allowed to push (missing authorization for orga)
    todo('other forbidden reason');
    return null;
  }
}

module.exports = { AccessDeniedIssueAnalyzer };
