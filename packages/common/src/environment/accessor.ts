export class PropertyAccessorWrapper {
  constructor(private obj: any) {}

  has(prop: string): boolean {
    if (!prop) {
      return !!this.obj;
    }
    const parts = this.parts(prop);
    let current = this.obj;
    for (let part of parts) {
      if (!(part in current)) {
        return false;
      }
      current = current[part];
    }
    return true;
  }

  get(prop: string): any | null {
    if (!prop) {
      return this.obj;
    }
    const parts = this.parts(prop);
    let current = this.obj;
    for (let part of parts) {
      if (!(part in current)) {
        return null;
      }
      current = current[part];
    }
    return current;
  }

  private parts(prop: string): string[] {
    return prop.split('.');
  }
}
