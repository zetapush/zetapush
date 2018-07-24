import { And } from './grammar';

export abstract class AbstractParent<P> implements And<P> {
  constructor(private parentConfigurer: P) {}

  and(): P {
    return this.parentConfigurer;
  }
}
