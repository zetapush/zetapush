import { Injectable } from '@zetapush/core';
import { UuidGenerator, IllegalArgumentError, Uuid } from '../../api';

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
  constructor(private length: number = 20) {
    super();
    if (length <= 0) {
      throw new IllegalArgumentError('Uuid size must contain at least one character', 'length');
    }
  }

  async generate(): Promise<Uuid> {
    const ts = new Date().valueOf();
    let asStr = '' + ts;
    let rand;
    do {
      rand = Math.random();
      const randStr = '' + rand;
      if (randStr.startsWith('0.')) {
        asStr += randStr.substr(2);
      }
    } while (asStr.length < this.length);
    return { value: asStr.substr(0, this.length) };
  }
}
