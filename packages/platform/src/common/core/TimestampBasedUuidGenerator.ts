import { UuidGenerator, Uuid } from '../api';
import { Injectable } from 'injection-js';

/**
 * Generate a unique identifier based on two factors:
 * - The timestamp in milliseconds
 * - A floating point random number
 *
 * Both are then converted to strings and concatenated to give something like this:
 * '1531139493218' + '0.2424469775285727' = '15311394932180.2424469775285727'.
 *
 * The '0.' characters are removed.
 */
@Injectable()
export class TimestampBasedUuidGenerator extends UuidGenerator {
  async generate(): Promise<Uuid> {
    const ts = new Date().valueOf();
    let rand;
    do {
      rand = Math.random();
    } while (rand === 1 || rand === 0);
    const asStr = '' + ts + ('' + rand).substr(2);
    return { value: asStr };
  }
}
