import { Template, Variables, Location } from '../Templating';
import { BaseError } from './BaseError';

export class ResourceError extends BaseError {
  constructor(message: string, public cause?: Error) {
    super(message);
  }
}

export class ResourceResolutionError extends ResourceError {
  constructor(message: string, public location: Location, cause?: Error) {
    super(message, cause);
  }
}
