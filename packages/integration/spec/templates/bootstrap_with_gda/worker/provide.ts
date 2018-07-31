// import { Injectable, Gda,GdaConfigurer, GdaDataType } from "../../../../../platform"
import { Injectable, Gda, GdaConfigurer, GdaDataType } from '@zetapush/platform';

@Injectable()
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
    await this.gda.put({
      column: 'test',
      data: 'Python is better',
      key: 'test',
      table: 'test'
    });
  }
}
