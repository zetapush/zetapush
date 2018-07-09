/**
 * ================================
 * Template Managers
 * ================================
 */
export interface TemplateManager {
  loadAndParse(location: Location, variables: Variables): Promise<Template>;
}

export interface ResourceResolver {
  resolve(location: Location): Promise<Resource>;
}

export interface TemplateParser {
  parse(resource: Resource, variables: Variables): Promise<ParsedTemplate>;
}

/**
 * ================================
 * Utils types / interfaces
 * ================================
 */
export interface Template {}

export interface StringTemplate extends Template {}

export interface ParsedTemplate extends Template {}

export interface Variables {}

export interface Resource {}

export interface Location {}
