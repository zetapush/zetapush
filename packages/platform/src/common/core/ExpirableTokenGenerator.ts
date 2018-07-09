import { TokenGenerator, Token, ExpirableToken } from '../api/Token';
import { IllegalArgumentError } from '../api/exception';

export class ExpirableTokenGenerator implements TokenGenerator {
  constructor(
    private delegate: TokenGenerator,
    private validityDuration: number,
  ) {}

  generate(): ExpirableToken {
    const token = this.delegate.generate();
    const expires = new Date().valueOf() + this.validityDuration;
    return new ExpirableToken(token, expires);
  }
}
