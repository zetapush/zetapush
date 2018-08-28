import { Injectable } from '@zetapush/core';

export class ConfigurableApiOptions {
  enabled = false;
  typeof = 'ConfigurableApiOptions';
  createdAt = Date.now();
  getTTL() {
    console.log(this);
    return Date.now() - this.createdAt;
  }
}

@Injectable()
export class ConfigurableApi {
  constructor(private options: ConfigurableApiOptions) {}
  isEnabled() {
    return this.options.enabled;
  }
  getType() {
    return this.options.typeof;
  }
  getTTL() {
    return this.options.getTTL();
  }
}
