export class IllegalArgumentError extends Error {
  constructor(message: string, private argumentName: string) {
    super(message);
  }
}
