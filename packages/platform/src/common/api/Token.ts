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

export class ExpirableToken implements Token {
  /**
   * @param original The original token that has been generated
   * @param expires The expiration date as timestamp
   */
  constructor(public original: Token, public expires: number) {}

  get value() {
    return this.original.value;
  }
}

export class TokenGenerationError extends Error {}
