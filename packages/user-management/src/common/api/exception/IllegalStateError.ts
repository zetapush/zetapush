import { BaseError } from './BaseError';

export class IllegalStateError extends BaseError {
  constructor(message: string, public cause?: Error) {
    super(message);
  }
}
