export class IllegalArgumentError extends Error {
  constructor(message: string, public argumentName: string) {
    super(message);
  }
}
