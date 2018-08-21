/**
 * ================================
 * Template Managers
 * ================================
 */
export interface TemplateManager {
  loadAndParse(location: Location, variables: Variables): Promise<ParsedTemplate>;
}
export abstract class TemplateManagerInjectable {
  abstract loadAndParse(location: Location, variables: Variables): Promise<ParsedTemplate>;
}

export interface ResourceResolver {
  resolve(location: Location): Promise<Resource | null>;
}
export abstract class ResourceResolverInjectable implements ResourceResolver {
  abstract resolve(location: Location): Promise<Resource | null>;
}

export interface TemplateParser {
  parse(template: Template, variables: Variables): Promise<ParsedTemplate>;
}
export abstract class TemplateParserInjectable implements TemplateParser {
  abstract parse(template: Template, variables: Variables): Promise<ParsedTemplate>;
}

export interface FixedLocationTemplateHelper {
  parse(variables: Variables): Promise<ParsedTemplate | null>;
}
export abstract class FixedLocationTemplateHelperInjectable implements FixedLocationTemplateHelper {
  abstract parse(variables: Variables): Promise<ParsedTemplate | null>;
}

export interface VariablesProvider {
  getVariables(original?: Variables): Promise<Variables>;
}
export abstract class VariablesProviderInjectable implements VariablesProvider {
  abstract getVariables(original?: Variables): Promise<Variables>;
}

/**
 * ================================
 * Utils types / interfaces
 * ================================
 */
export interface Template {
  resource: Resource;
}

export interface ParsedTemplate {}

export interface Variables {
  readonly [property: string]: any;
}

export interface Resource {
  content(): string;
}

export interface Location {}
