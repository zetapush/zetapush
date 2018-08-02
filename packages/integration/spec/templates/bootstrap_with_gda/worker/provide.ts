import { Gda, GdaConfigurer, GdaDataType } from '../../../../../platform-legacy';
import { Injectable } from '@zetapush/core';
// import { Injectable, Gda, GdaConfigurer, GdaDataType } from '@zetapush/platform-legacy';

@Injectable
export class Provide {
  constructor(private gdac: GdaConfigurer, private gda: Gda) {}

  async onApplicationBootstrap() {
    await this.gdac.createTable({
      columns: [
        {
          name: 'test',
          type: GdaDataType.STRING
        }
      ],
      name: 'test'
    });
  }
}
