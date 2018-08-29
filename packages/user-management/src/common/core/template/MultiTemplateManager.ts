import { TemplateManager, Location, Variables, ParsedTemplate } from '../../api';

export class MultiParsedTemplate implements ParsedTemplate {
  constructor(private results: { name: string; result: ParsedTemplate }[]) {}

  getResult(name: string) {
    const matching = this.results.find((r) => r.name == name);
    return matching ? matching.result : null;
  }
}

export class MultiTemplateManager implements TemplateManager {
  constructor(private delegates: { name: string; manager: TemplateManager }[]) {}

  async loadAndParse(location: Location, variables: Variables): Promise<ParsedTemplate> {
    const parsed = [];
    for (let delegate of this.delegates) {
      parsed.push({ name: delegate.name, result: await delegate.manager.loadAndParse(location, variables) });
    }
    return new MultiParsedTemplate(parsed);
  }
}
