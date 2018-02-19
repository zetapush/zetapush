import { Service } from '../core/index.js';

/**
 * Generic Data Access
 *
 * Generic Data Access Service : NoSQL storage
 * */
/**
 * GDA User API
 *
 * User API for Generic Data Access.
 * The data are stored on a per-user basis.
 * Users can put, get, list their data.
 * @access public
 * */
export class Gda extends Service {
  /**
   * Get default deployment id associated to Gda service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'gda_0';
  }
  /**
   * Asks for a data row
   *
   * Returns a full data row.
   * */
  get({ table, key, owner }) {
    return this.$publish('get', { table, key, owner });
  }
  /**
   * Asks for a data cell
   *
   * Returns a precise list of cells from a column in a data row.
   * */
  getCells({ table, key, key2, owner, column }) {
    return this.$publish('getCells', { table, key, key2, owner, column });
  }
  /**
   * Increments an integer value
   *
   * Increments a cell 64-bit signed integer value and returns the result in the data field.
   * The increment is atomic : if you concurrently increment 10 times a value by 1, the final result will be the initial value plus 10. The actual individual resulting values seen by the 10 concurrent callers may vary discontinuously, with duplicates : at least one of them will see the final (+10) result.
   * */
  inc({ table, data, key, key2, owner, column }) {
    return this.$publish('inc', { table, data, key, key2, owner, column });
  }
  /**
   * Asks for a list of rows
   *
   * Returns a paginated list of rows from the given table.
   * */
  list({ columns, table, owner, page }) {
    return this.$publish('list', { columns, table, owner, page });
  }
  /**
   * Puts some data into a cell
   *
   * Creates or replaces the contents of a particular cell.
   * */
  put({ table, data, key, key2, owner, column }) {
    return this.$publish('put', { table, data, key, key2, owner, column });
  }
  /**
   * Puts several rows
   *
   * Creates or replaces the (maybe partial) contents of a collection of rows.
   * This method only creates or replaces cells for non-null input values.
   * */
  puts({ rows, table, owner }) {
    return this.$publish('puts', { rows, table, owner });
  }
  /**
   * Asks for a range of rows
   *
   * Returns a paginated range of rows from the given table.
   * A range consists of consecutive rows from the start key (inclusive) to the stop key (exclusive).
   * You can specify partial keys for the start and stop fields.
   * */
  range({ columns, start, table, stop, owner, page }) {
    return this.$publish('range', { columns, start, table, stop, owner, page });
  }
  /**
   * Removes one cell inside a column of a row
   *
   * Removes only one cell of the given column of the given row from the given table.
   * */
  removeCell({ table, key, key2, owner, column }) {
    return this.$publish('removeCell', { table, key, key2, owner, column });
  }
  /**
   * Removes one full column of a row
   *
   * Removes all cells of the given column of the given row from the given table.
   * */
  removeColumn({ table, key, owner, column }) {
    return this.$publish('removeColumn', { table, key, owner, column });
  }
  /**
   * Removes a range of rows
   *
   * Removes the specified columns of the given range of rows from the given table.
   * */
  removeRange({ columns, start, table, stop, owner }) {
    return this.$publish('removeRange', { columns, start, table, stop, owner });
  }
  /**
   * Removes one full row
   *
   * Removes all columns of the given row from the given table.
   * */
  removeRow({ table, key, owner }) {
    return this.$publish('removeRow', { table, key, owner });
  }
}
