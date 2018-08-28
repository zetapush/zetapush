import { Configurer } from '../Core/index';
import { Rdbms } from './Rdbms';
import { RdbmsSimpleQuery } from './RdbmsTypes';

/**Relational Database : SQL storage*/
export class RdbmsConfigurer extends Configurer {
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
  ddl(body: RdbmsSimpleQuery): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Rdbms.DEFAULT_DEPLOYMENT_ID,
      'rdbms/ddl'
    );
  }
}
