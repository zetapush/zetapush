export interface Token {
  value: string;
}

export interface TokenGenerator {
  generate(): Token;
}
