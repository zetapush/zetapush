export class IllegalArgumentError extends Error {
  constructor(message: string, public argumentName: string, public cause?: Error) {
    super(message);
  }
}

export class IllegalArgumentValueError extends IllegalArgumentError {
  constructor(message: string, public argumentName: string, public argumentValue: any, public cause?: Error) {
    super(message, argumentName, cause);
  }
}
