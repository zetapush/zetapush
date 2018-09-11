import { BaseError } from '../error';

export class ConfigurationError extends BaseError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class ConfigurationStateError extends ConfigurationError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}

export class ConfigurationFileLoadError extends ConfigurationError {
  constructor(message: string, public file: string, cause?: Error) {
    super(message, cause);
  }
}

export class ConfigurationReloadError extends ConfigurationError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
  }
}
export class MissingConfigurationProperty extends ConfigurationError {
  constructor(message: string, public key: string, cause?: Error) {
    super(message, cause);
  }
}
