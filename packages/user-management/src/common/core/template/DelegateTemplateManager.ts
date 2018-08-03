import { TemplateManager, Location, Variables, ParsedTemplate, TemplateParser, ResourceResolver } from '../../api';
import { FuncCallTemplateParser } from './FuncCallTemplateParser';

export class DelegateTemplateManager implements TemplateManager {
  constructor(private templateResolver: ResourceResolver, private parser: TemplateParser) {}

  async loadAndParse(location: Location, variables: Variables): Promise<ParsedTemplate> {
    const template = await this.templateResolver.resolve(location);
    return await this.parser.parse({ resource: template }, variables);
  }
}
