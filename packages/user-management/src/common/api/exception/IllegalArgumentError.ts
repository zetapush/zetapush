import { BaseError } from './BaseError';

export class IllegalArgumentError extends BaseError {
  constructor(message: string, public argumentName: string, public cause?: Error) {
    super(message);
  }
}

export class IllegalArgumentValueError extends IllegalArgumentError {
  constructor(message: string, public argumentName: string, public argumentValue: any, cause?: Error) {
    super(message, argumentName, cause);
  }
}
