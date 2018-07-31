// import { Injectable, Gda } from "../../../../../platform"
import { Injectable, Gda } from '@zetapush/platform';
import { Provide } from './provide';
import { resolve } from 'url';

const sleep = (mil: number) => {
  return new Promise((resolve) => setTimeout(resolve, mil));
};

@Injectable()
export default class Api {
  constructor(private gda: Gda, private provide: Provide) {}

  async onApplicationBootstrap() {
    const res = await this.gda.get({
      key: 'test',
      table: 'test'
    });
    console.log('\n\n\n\nnRAISIN : ', res);
  }
}
