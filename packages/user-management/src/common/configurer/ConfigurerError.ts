import { BaseError } from '@zetapush/common';

export class ConfigurerError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

export class MissingMandatoryConfigurationError extends ConfigurerError {
  constructor(message: string) {
    super(message);
  }
}

export class InstantiationError extends ConfigurerError {
  constructor(message: string, public cause: Error) {
    super(message);
  }
}
