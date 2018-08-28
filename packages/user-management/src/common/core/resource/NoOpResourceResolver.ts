import { ResourceResolver, Location, Resource } from '../../api';

export class UndefinedLocation implements Location {}

export class EmptyResource implements Resource {
  content() {
    return '';
  }
}

export class NoOpResourceResolver implements ResourceResolver {
  constructor(private resource: Resource = new EmptyResource()) {}

  async resolve(location: Location): Promise<Resource> {
    return this.resource;
  }
}
