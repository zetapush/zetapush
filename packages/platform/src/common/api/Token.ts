/**
 * ================================
 * Token Managers
 * ================================
 */
export interface TokenGenerator {
  generate(): Token;
}

/**
 * ================================
 * Utils Type / Interfaces
 * ================================
 */
export interface Token {
  value: string;
}
