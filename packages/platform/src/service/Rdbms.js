import { Service } from '../core/index.js';

/**
 * RDBMS
 *
 * Relational Database : SQL storage
 * */
/**
 * RDBMS User API
 *
 * User API for SQL queries.
 * Contrary to GDA or Stacks, the data are not stored on a per-user basis.
 * Users can store, get, list their data.
 * @access public
 * */
export class Rdbms extends Service {
  /**
   * Get default deployment id associated to Rdbms service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'rdbms_0';
  }
}
