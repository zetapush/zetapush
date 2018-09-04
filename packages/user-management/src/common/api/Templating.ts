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

export interface VariablesProvider<T extends Variables> {
  getVariables(original?: Variables): Promise<T>;
}
export abstract class VariablesProviderInjectable<T extends Variables> implements VariablesProvider<T> {
  abstract getVariables(original?: Variables): Promise<T>;
}

/**
 * ================================
 * Utils types / interfaces
 * ================================
 */
export interface Template {
  resource: Resource;
}

export interface ParsedTemplate {
  toString(): string;
}

export interface Variables {
  readonly [property: string]: any;
}

export interface Resource {
  content(): string;
}

export interface Location {}
