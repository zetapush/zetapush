import { Template, Variables, Location } from '../Templating';
import { BaseError } from '@zetapush/common';

export class TemplateError extends BaseError {
  constructor(message: string, public cause?: Error) {
    super(message);
  }
}

export class TemplateParseError extends TemplateError {
  constructor(message: string, public template: Template, public variables: Variables, cause?: Error) {
    super(message, cause);
  }
}

export class TemplateEvaluationError extends TemplateParseError {
  constructor(message: string, template: Template, variables: Variables, cause: Error) {
    super(message, template, variables, cause);
  }
}

export class TemplateResolutionError extends TemplateError {
  constructor(message: string, public location: Location, cause?: Error) {
    super(message, cause);
  }
}
