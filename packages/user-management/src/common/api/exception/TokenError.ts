import { Token, TokenStorageManager, TokenGenerator } from '../Token';

export class TokenStorageInitError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
  }
}

export abstract class TokenError extends Error {
  constructor(message: string, public token?: Token, public cause?: Error) {
    super(message);
  }
}

export class GenerateTokenError extends TokenError {
  constructor(message: string, cause?: Error) {
    super(message, undefined, cause);
  }
}

export class MissingTokenError extends TokenError {
  constructor(message: string, token: Token, cause?: Error) {
    super(message, token, cause);
  }
}

export class AlreadyUsedTokenError extends TokenError {
  constructor(message: string, token: Token) {
    super(message, token);
  }
}

export class ExpiredTokenError extends TokenError {
  constructor(message: string, token: Token) {
    super(message, token);
  }
}

export class GetTokenFromStorageError extends TokenError {
  constructor(message: string, token: Token, cause?: Error) {
    super(message, token, cause);
  }
}

export class TokenNotFoundError extends TokenError {
  constructor(message: string, token: Token, cause?: Error) {
    super(message, token, cause);
  }
}

export class DeleteTokenFromStorageError extends TokenError {
  constructor(message: string, token: Token, cause?: Error) {
    super(message, token, cause);
  }
}

export class StoreTokenIntoStorageError extends TokenError {
  constructor(message: string, token: Token, cause?: Error) {
    super(message, token, cause);
  }
}

export class NoAccountAssociatedToTokenError extends TokenError {
  constructor(message: string, token: Token) {
    super(message, token);
  }
}
