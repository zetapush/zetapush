import { ParsedTemplate, Template } from '../../api';

export class ParsedTemplateString implements ParsedTemplate {
  constructor(public source: Template, protected parsedResult: string) {}

  toString() {
    return this.parsedResult;
  }
}
