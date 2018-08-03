import { UuidGenerator, Uuid, IllegalArgumentError } from '../../api';

/**
 * Simple implementation that just delegates to a function call.
 *
 * The aim is to provide a bridge between user needs and avoiding internal code complexity.
 *
 * The user has the possibility to use a function as UuidGenerator whereas the code always
 * only handles one concept.
 *
 * @see UuidGenerator
 * @see Uuid
 */
export class FuncCallUuidGenerator extends UuidGenerator {
  /**
   * Initialize with the function used to delegate Uuid generation.
   *
   * @param {Function} func the function used to generate a Uuid.
   * The function takes no parameter and returns a Uuid instance.
   */
  constructor(private func: () => Promise<Uuid>) {
    super();
    if (!func) {
      throw new IllegalArgumentError('Generator function is required', 'func');
    }
  }

  generate(): Promise<Uuid> {
    return this.func();
  }
}
