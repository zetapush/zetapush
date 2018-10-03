import { Location, TemplateManager, Variables, ParsedTemplate, FixedLocationTemplateHelper } from '../../api';

export class FixedLocationTemplateManagerHelper implements FixedLocationTemplateHelper {
  constructor(protected location?: Location, protected templateManager?: TemplateManager) {}

  async parse(variables: Variables): Promise<ParsedTemplate | null> {
    const templateManager = this.templateManager;
    const location = this.location;
    if (templateManager && location) {
      return await templateManager.loadAndParse(location, variables);
    }
    return null;
  }
}
