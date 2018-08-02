export class IllegalStateError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
  }
}
