import { Token } from '../Token';
import { BaseError } from '@zetapush/common';

export abstract class TokenError extends BaseError {
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

export class InvalidTokenError extends TokenError {
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
