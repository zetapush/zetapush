/**
 * ================================
 * Token Managers
 * ================================
 */
export interface TokenGenerator {
  generate(): Promise<Token>;
}

/**
 * ================================
 * Utils Type / Interfaces
 * ================================
 */
export interface Token {
  value: string;
}
