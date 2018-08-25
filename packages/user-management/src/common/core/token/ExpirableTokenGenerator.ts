import { TokenGenerator, Token } from '../../api/Token';
import { IllegalArgumentError } from '../../api/exception';

export class ExpirableToken implements Token {
  /**
   * @param original The original token that has been generated
   * @param expires The expiration date as timestamp
   */
  constructor(public original: Token, public expires: number) {}

  get value() {
    return this.original.value;
  }
}

export class ExpirableTokenGenerator implements TokenGenerator {
  constructor(private delegate: TokenGenerator, private validityDuration: number) {}

  async generate(): Promise<ExpirableToken> {
    const token = await this.delegate.generate();
    const expires = new Date().valueOf() + this.validityDuration;
    return new ExpirableToken(token, expires);
  }
}
