import { TemplateParser, ParsedTemplate, Resource, Variables, Template } from '../../api';
import { ParsedTemplateString } from './ParsedTemplateString';
import { TemplateEvaluationError } from '../../api/exception/TemplateError';

export class FuncCallTemplateParser implements TemplateParser {
  constructor(private func: (variables: Variables) => string) {}

  async parse(template: Template, variables: Variables): Promise<ParsedTemplate> {
    try {
      return new ParsedTemplateString(template, this.func(variables));
    } catch (e) {
      throw new TemplateEvaluationError('Failed to execute evaluation function', template, variables, e);
    }
  }
}
