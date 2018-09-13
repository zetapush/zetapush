import { Service } from '../Core/index';
import { RdbmsQuery, RdbmsResultSet } from './RdbmsTypes';

/**
 * RDBMS
 *
 * Relational Database : SQL storage
 * */
export class Rdbms extends Service {
  /**
   * Get deployment type associated to Rdbms service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'rdbms';
  }
  /**
   * Get default deployment id associated to Rdbms service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'rdbms_0';
  }
  /**
   * RDBMS User API
   *
   * User API for SQL queries.
   * Contrary to GDA or Stacks, the data are not stored on a per-user basis.
   * Users can store, get, list their data.
   * @access public
   * */
  /**
   * Runs a query.
   *
   * Runs a DML query with SQL syntax on this database.
   * The @@sql statement supports inline SQL (unquoted), embedded constants (prefixed by '$', unescaped and statically replaced in the generated SQL query), embedded parameters (prefixed by ':', dynamically replaced and escaped at run-time)
   * The returned RdbmsResultSet is an iterable collection of rows.
   * The returned result set is iterable only once.
   * The content of a row is accessible only when it is being iterated on.
   * @access public
   * */
  query(body: RdbmsQuery): Promise<RdbmsResultSet> {
    return this.$publish('query', body);
  }
  /**
   * Runs an update.
   *
   * Runs a DML update with SQL syntax on this database.
   * @access public
   * */
  update(body: RdbmsQuery) {
    this.$publish('update', body);
  }
}
