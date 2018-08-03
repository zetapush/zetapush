import { Template, Variables, Location } from '../Templating';

export abstract class TemplateError extends Error {}

export class TemplateParseError extends TemplateError {
  constructor(message: string, public template: Template, public variables: Variables, public cause?: Error) {
    super(message);
  }
}

export class TemplateEvaluationError extends TemplateParseError {
  constructor(message: string, template: Template, variables: Variables, cause: Error) {
    super(message, template, variables, cause);
  }
}

export class TemplateResolutionError extends TemplateError {
  constructor(message: string, public location: Location, public cause?: Error) {
    super(message);
  }
}
