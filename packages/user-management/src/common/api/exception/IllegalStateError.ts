import { BaseError } from '@zetapush/common';

export class IllegalStateError extends BaseError {
  constructor(message: string, public cause?: Error) {
    super(message);
  }
}
