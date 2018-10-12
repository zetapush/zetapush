export class BaseError extends Error {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
    this.name = this.constructor.name;
  }

  toString() {
    return `${this.getType(this)}${this.message}${this.getCauseString()}`;
  }

  getType(error) {
    return `[${error.name || 'raw error'}] `;
  }

  getCauseString() {
    if (!this.cause) {
      return '';
    }
    return `\nCause: ${
      this.cause instanceof BaseError ? this.cause.toString() : this.getTypedCauseMessage(this.cause)
    }`;
  }

  getTypedCauseMessage(error) {
    return `${this.getType(error)}${error.message || error}`;
  }
}

/**
 * Analyze a technical error to provide a more understandable error for end-users and developers.
 *
 * @param {any} error The error to analyze
 * @param {any} context Any additional information about the execution context that may be useful for error analysis
 * @param {Object} ext Any object provided by the server
 * @returns {Promise} a promise that returns a formatted error
 */
export const analyze = (error, context, ext) => {
  return defaultAnalyzer().analyze(error, context, ext);
};

const defaultAnalyzer = () =>
  new ErrorAnalyzer(new AccountStatusAnalyzer(), new AuthenticationErrorAnalyzer(), new ConnectionErrorAnalyzer());

class ErrorAnalyzer {
  constructor(...delegates) {
    this.delegates = delegates;
  }

  async analyze(error, context, ext) {
    for (let delegate of this.delegates) {
      const analyzed = await delegate.analyze(error, context, ext);
      if (analyzed) {
        return analyzed;
      }
    }
    return error;
  }
}

class AccountStatusAnalyzer {
  async analyze(error, context, ext) {
    // if not an error due to account inactive => skip
    if (context !== 'CONNECTION_FAILED' || !this.isAccountInactive(error, ext)) {
      return null;
    }
    if (this.isAccountNotConfirmed(ext)) {
      return new AccountNotConfirmedError(`Your account has been created but you haven't confirmed it yet`, error, ext);
    } else {
      return new AccountDisabledError(`Your account has been disabled`, error, ext);
    }
  }

  isAccountInactive(error, ext) {
    if (!ext || !ext.error) {
      return false;
    }
    return error === '403::Handshake denied' && ext.error.code === 'ACCOUNT_INACTIVE';
  }

  isAccountNotConfirmed(ext) {
    // TODO: works only with standard status. How to provide custom status ?
    const { cause } = ext.error;
    const { context } = cause || {};
    const { status } = context || {};
    return status && status.data === 'WAITING_FOR_CONFIRMATION';
  }
}

class AuthenticationErrorAnalyzer {
  async analyze(error, context, ext) {
    // if not an error due to authentication failure => skip
    if (context !== 'CONNECTION_FAILED' || !this.isAuthenticationFailed(error)) {
      return null;
    }
    if (this.isBadCredentials(ext)) {
      return new BadCredentialsError(`The login and/or password are incorrect`, error, ext);
    }
    if (this.isAuthenticationTokenNotFound(ext)) {
      return new AuthenticationTokenNotFoundError(`The authentication token doesn't exist`, error, ext);
    }
    return null;
  }

  isAuthenticationFailed(error) {
    return error === '403::Handshake denied';
  }
  isBadCredentials(ext) {
    return ext.error.code === 'SIMPLE_UNMATCHED_LOGIN_PASSWORD';
  }
  isAuthenticationTokenNotFound(ext) {
    return ext.error.code === 'TOKEN_NOT_FOUND';
  }
}

class ConnectionErrorAnalyzer {
  async analyze(error, context, ext) {
    // if not an error due to connection error => skip
    if (context !== 'CONNECTION_FAILED') {
      return null;
    }
    if (this.isNetworkError(error)) {
      // TODO: add more useful information
      return new ConnectionEstablishmentFailed(`Unable to establish connection to the platform`, error);
    }
    return new ConnectionError(`Failed to connect to the platform`, new PlatformError(error));
  }

  isNetworkError(error) {
    return error.message === 'Negotiation Failed' || error.message === 'No Server Url Available';
  }
}

export class PlatformError extends BaseError {
  constructor(rawError) {
    const cause = rawError.cause ? new PlatformError(rawError.cause) : null;
    super(rawError, cause);
    this.message = rawError.message;
    this.code = rawError.code;
  }
}

export class ConnectionError extends BaseError {
  constructor(message, cause, ext) {
    super(message, cause);
    this.ext = ext;
  }
}
export class AccountNotConfirmedError extends ConnectionError {}
export class AccountDisabledError extends ConnectionError {}
export class BadCredentialsError extends ConnectionError {}
export class AuthenticationTokenNotFoundError extends BadCredentialsError {}
export class ConnectionEstablishmentFailed extends ConnectionError {}
