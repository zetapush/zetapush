import { Alternative } from './grammar';

export class AlternativeHelper<S> implements Alternative<S> {
  private enableFunc?: () => boolean | Promise<boolean>;
  private enabled?: boolean;
  constructor(private self: S) {}

  enable(enable: boolean): S;
  enable(enable: () => boolean | Promise<boolean>): S;
  enable(enable: any): S {
    if (typeof enable === 'function') {
      this.enableFunc = enable;
    } else {
      this.enabled = enable;
    }
    return this.self;
  }

  async isEnabled() {
    if (this.enableFunc) {
      return await this.enableFunc();
    }
    return this.enabled;
  }
}
