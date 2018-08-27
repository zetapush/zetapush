import { ParsedTemplate, Template } from '../../api';

export class ParsedTemplateString implements ParsedTemplate {
  constructor(public source: Template, private parsedResult: string) {}

  toString() {
    return this.parsedResult;
  }
}
