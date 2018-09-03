import { BaseError } from '@zetapush/common';

export class ConfigurerError extends BaseError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class ConfigurationValidationError extends ConfigurerError {
  constructor(message: string, public invalids: Error[]) {
    super(message);
  }

  toString(): string {
    const msg = super.toString();
    return `${msg}. Invalid configurations: \n- ${this.invalids.join('\n- ')}`;
  }
}

export class MissingMandatoryConfigurationError extends ConfigurerError {
  constructor(message: string) {
    super(message);
  }
}

export class InstantiationError extends ConfigurerError {
  constructor(message: string, cause: Error) {
    super(message, cause);
  }
}
