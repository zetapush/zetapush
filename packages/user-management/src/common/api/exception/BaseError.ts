export abstract class BaseError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = this.constructor.name;
  }

  toString(): string {
    return `${this.getType(this)}${this.message}${this.getCauseString()}`;
  }

  private getType(error: Error) {
    return `[${error.name || 'raw error'}] `;
  }

  private getCauseString() {
    if (!this.cause) {
      return '';
    }
    return `\nCause: ${
      this.cause instanceof BaseError ? this.cause.toString() : this.getTypedCauseMessage(this.cause)
    }`;
  }

  private getTypedCauseMessage(error: Error) {
    return `${this.getType(error)}${error.message}`;
  }
}

// TODO: check result outside of jasmine (jasmine treats errors his own way)
// TODO: wrap platform exceptions (code+message) in particular error class ?
// TODO: use Error.prepareStackTrace(error, structuredStackTrace) ?
// TODO: use lib like https://github.com/defunctzombie/node-superstack or https://github.com/ddsol/superStack ?
