import { BaseError } from '@zetapush/common';

export class InitializationError extends BaseError {
  constructor(message: string, public cause: Error) {
    super(message);
  }
}

export class BootstrapError extends InitializationError {
  constructor(message: string, cause: Error) {
    super(message, cause);
  }
}
