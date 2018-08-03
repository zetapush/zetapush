/**
 * ================================
 * Template Managers
 * ================================
 */
export interface TemplateManager {
  loadAndParse(location: Location, variables: Variables): Promise<ParsedTemplate>;
}

export interface ResourceResolver {
  resolve(location: Location): Promise<Resource>;
}

export interface TemplateParser {
  parse(template: Template, variables: Variables): Promise<ParsedTemplate>;
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
  [property: string]: any;
}

export interface Resource {
  content(): string;
}

export interface Location {}
