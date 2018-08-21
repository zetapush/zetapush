import {
  TemplateManager,
  Location,
  Variables,
  ParsedTemplate,
  TemplateParser,
  ResourceResolver,
  TemplateResolutionError,
  TemplateError
} from '../../api';
import { ResourceError } from '../../api/exception/ResourceError';

export class DelegateTemplateManager implements TemplateManager {
  constructor(private templateResolver: ResourceResolver, private parser: TemplateParser) {}

  async loadAndParse(location: Location, variables: Variables): Promise<ParsedTemplate> {
    try {
      const template = await this.templateResolver.resolve(location);
      if (!template) {
        throw new TemplateResolutionError(`No resolver was able to load template`, location);
      }
      return await this.parser.parse({ resource: template }, variables);
    } catch (e) {
      if (e instanceof TemplateError) {
        throw e;
      }
      if (e instanceof ResourceError) {
        throw new TemplateResolutionError(`Failed to load template`, location, e);
      }
      throw new TemplateError(`Failed to load or parse template`, e);
    }
  }
}
