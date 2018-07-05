import { Provider } from '../Provider';
import { Rdbms } from '../Rdbms';
import * as zp from '../all_types';

/**Relational Database : SQL storage*/
export class RdbmsProvider extends Provider {
  /**
   * Administrative API for rdbms management.
   *
   * You can create and list tables
   * */
  /**
   * Issues a DDL query
   *
   * Runs the given query or queries.
   * */
  async ddl(body: zp.RdbmsSimpleQuery): Promise<void> {
    return await this.provide(body, Rdbms.DEFAULT_DEPLOYMENT_ID, '/rdbms/ddl');
  }
}
