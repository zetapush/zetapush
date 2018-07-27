export interface Uuid {
  value: string;
}

export abstract class UuidGenerator {
  abstract generate(): Promise<Uuid>;
}
