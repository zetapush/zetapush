import { Location, ResourceResolver, Resource } from '../../api';

export class NamedLocation implements Location {
  constructor(private name: string) {}
}

export class NamedResourceResolver implements ResourceResolver {
  async resolve(location: Location): Promise<Resource | null> {
    if (location instanceof NamedLocation) {
      // TODO: search for resource in a registry
      throw 'Not implemented';
    } else {
      return null;
    }
  }
}
