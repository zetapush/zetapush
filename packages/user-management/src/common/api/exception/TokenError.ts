import { Token, TokenStorageManager, TokenGenerator } from '../Token';

export abstract class TokenError extends Error {}

export class GenerateTokenError extends TokenError {
  constructor(message: string, generator: TokenGenerator) {
    super(message);
  }
}

export class MissingTokenError extends TokenError {
  constructor(message: string, token: Token, storage: TokenStorageManager, details?: any) {
    super(message);
  }
}

export class AlreadyUsedTokenError extends TokenError {
  constructor(message: string, token: Token, storage: TokenStorageManager) {
    super(message);
  }
}

export class ExpiredTokenError extends TokenError {
  constructor(message: string, token: Token, storage: TokenStorageManager) {
    super(message);
  }
}

export class GetTokenFromStorageError extends TokenError {
  constructor(message: string, token: Token, storage: TokenStorageManager, details?: any) {
    super(message);
  }
}

export class DeleteTokenFromStorageError extends TokenError {
  constructor(message: string, token: Token, storage: TokenStorageManager, details?: any) {
    super(message);
  }
}

export class StoreTokenIntoStorageError extends TokenError {
  constructor(message: string, token: Token, storage: TokenStorageManager, details?: any) {
    super(message);
  }
}

export class PrepareTokenStorageError extends TokenError {
  constructor(message: string, storage: TokenStorageManager) {
    super(message);
  }
}

export class NoAccountAssociatedToTokenError extends TokenError {
  constructor(message: string, token: Token) {
    super(message);
  }
}
