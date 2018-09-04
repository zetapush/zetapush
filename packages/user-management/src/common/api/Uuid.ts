export interface Uuid {
  value: string;
}

export interface UuidGenerator {
  generate(): Promise<Uuid>;
}
export abstract class UuidGeneratorInjectable implements UuidGenerator {
  abstract generate(): Promise<Uuid>;
}
