import { TokenGenerator, Token } from '../../api/Token';
import { IllegalArgumentError } from '../../api/exception';

export class Base36RandomTokenGenerator implements TokenGenerator {
  constructor(protected length = 20) {
    if (this.length <= 0) {
      throw new IllegalArgumentError('Token size must contain at least one character', 'length');
    }
  }

  async generate(): Promise<Token> {
    let value = '';
    do {
      value += Math.random()
        .toString(36)
        .substr(2, 10);
    } while (value.length < this.length);
    return { value: value.substr(0, this.length) };
  }
}
