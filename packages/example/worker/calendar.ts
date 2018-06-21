import { Injectable } from '@zetapush/platform';

@Injectable()
export class Calendar {
  getNow() {
    return (new Date()).toLocaleDateString();
  }
}
