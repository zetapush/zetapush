export interface Uuid {
  value: string;
}

export interface UuidGenerator {
  generate(): Promise<Uuid>;
}
