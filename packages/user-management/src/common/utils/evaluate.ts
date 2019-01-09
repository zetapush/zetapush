import { PropertyAccessorWrapper, BaseError } from '@zetapush/common';
import { IllegalStateError } from '../api';

export class MissingKeyError extends BaseError {
  constructor(message: string, public readonly key: string, public readonly context: any, cause?: Error) {
    super(message, cause);
  }
}

export class EvaluatorMissingKeyHandlerBuilder {
  private errorMsgBuilder?: (key: string, context: any) => string;
  private defaultValueBuilder?: (key: string, context: any) => string;

  /**
   * If a key is missing then generate an error message and throw an exception.
   *
   * @param message either a message or a function that provides a
   * message according to the key and the evaluation context
   */
  error(message: string): this;
  error(messageProvider: (key: string, context: any) => string): this;
  error(messageBuilder: any): this {
    if (typeof messageBuilder === 'string') {
      this.errorMsgBuilder = (key: string, context: any) => messageBuilder;
    } else {
      this.errorMsgBuilder = messageBuilder;
    }
    return this;
  }

  /**
   * If a key is missing, then an empty string is used in place.
   */
  ignore(): this {
    this.defaultValueBuilder = () => '';
    return this;
  }

  /**
   * If a key is missing then replace by a string value.
   *
   * @param value either a value or a function that provides a
   * value according to the key and the context.
   */
  defaultValue(value: string): this;
  defaultValue(valueProvider: (key: string, context: any) => string): this;
  defaultValue(valueBuilder: any): this {
    if (typeof valueBuilder === 'string') {
      this.defaultValueBuilder = (key: string, context: any) => valueBuilder;
    } else {
      this.defaultValueBuilder = valueBuilder;
    }
    return this;
  }

  build(): (key: string, context: any) => string {
    if (this.defaultValueBuilder) {
      return this.defaultValueBuilder;
    }
    if (this.errorMsgBuilder) {
      return (key: string, context: any) => {
        throw new MissingKeyError(this.errorMsgBuilder!(key, context), key, context);
      };
    }
    throw new IllegalStateError(`You need to indicate which behavior before calling build`);
  }
}

export const failOnMissingKeyHandler = (key: string, context: any): string => {
  throw new MissingKeyError(`Can't access property ${key}`, key, context);
};

export class VariableEvaluator {
  constructor(private missingKeyHandler = failOnMissingKeyHandler) {}

  evaluate(str: string, context: any) {
    const accessor = new PropertyAccessorWrapper(context);
    return str.replace(/\$\{([^}]+)\}/g, (_, key) => {
      if (accessor.has(key)) {
        return accessor.get(key);
      }
      return this.missingKeyHandler(key, context);
    });
  }
}
