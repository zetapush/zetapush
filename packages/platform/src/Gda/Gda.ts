import { Service } from '../Core/index';
import {
  GdaCellRequest,
  GdaCellsRequest,
  GdaCellsResult,
  GdaColumnRequest,
  GdaFilterRequest,
  GdaFilterResult,
  GdaGet,
  GdaGetResult,
  GdaList,
  GdaListResult,
  GdaMultiGetRequest,
  GdaMultiGetResult,
  GdaPut,
  GdaPuts,
  GdaPutsResult,
  GdaRange,
  GdaRangeResult,
  GdaReduceRequest,
  GdaReduceResult,
  GdaRemoveRange,
  GdaRowRequest,
} from './GdaTypes';

/**
 * Generic Data Access
 *
 * Generic Data Access Service : NoSQL storage
 * */
export class Gda extends Service {
  /**
   * Get deployment type associated to Gda service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'gda';
  }
  /**
   * Get default deployment id associated to Gda service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'gda_0';
  }
  /**
   * GDA User API
   *
   * User API for Generic Data Access.
   * The data are stored on a per-user basis.
   * Users can put, get, list their data.
   * @access public
   * */
  /**
   * Filters a range of rows
   *
   * Similar to range, but rows can be filtered out according to a developer-supplied predicate.
   * A range consists of consecutive rows from the start key (inclusive) to the stop key (exclusive).
   * You can specify partial keys for the start and stop fields.
   * @access public
   * */
  filter(body: GdaFilterRequest): Promise<GdaFilterResult> {
    return this.$publish('filter', body);
  }
  /**
   * Asks for a data row
   *
   * Returns a full data row.
   * @access public
   * */
  get(body: GdaGet): Promise<GdaGetResult> {
    return this.$publish('get', body);
  }
  /**
   * Asks for a data cell
   *
   * Returns a precise list of cells from a column in a data row.
   * @access public
   * */
  getCells(body: GdaCellsRequest): Promise<GdaCellsResult> {
    return this.$publish('getCells', body);
  }
  /**
   * Increments an integer value
   *
   * Increments a cell 64-bit signed integer value and returns the result in the data field.
   * The increment is atomic : if you concurrently increment 10 times a value by 1, the final result will be the initial value plus 10. The actual individual resulting values seen by the 10 concurrent callers may vary discontinuously, with duplicates : at least one of them will see the final (+10) result.
   * @access public
   * */
  inc(body: GdaPut): Promise<GdaPut> {
    return this.$publish('inc', body);
  }
  /**
   * Asks for a list of rows
   *
   * Returns a paginated list of rows from the given table.
   * @access public
   * */
  list(body: GdaList): Promise<GdaListResult> {
    return this.$publish('list', body);
  }
  /**
   * Asks for several data rows
   *
   * Returns full data rows, in the order they were asked.
   * @access public
   * */
  mget(body: GdaMultiGetRequest): Promise<GdaMultiGetResult> {
    return this.$publish('mget', body);
  }
  /**
   * Puts some data into a cell
   *
   * Creates or replaces the contents of a particular cell.
   * @access public
   * */
  put(body: GdaPut): Promise<GdaPut> {
    return this.$publish('put', body);
  }
  /**
   * Puts several rows
   *
   * Creates or replaces the (maybe partial) contents of a collection of rows.
   * This method only creates or replaces cells for non-null input values.
   * @access public
   * */
  puts(body: GdaPuts): Promise<GdaPutsResult> {
    return this.$publish('puts', body);
  }
  /**
   * Asks for a range of rows
   *
   * Returns a paginated range of rows from the given table.
   * A range consists of consecutive rows from the start key (inclusive) to the stop key (exclusive).
   * You can specify partial keys for the start and stop fields.
   * @access public
   * */
  range(body: GdaRange): Promise<GdaRangeResult> {
    return this.$publish('range', body);
  }
  /**
   * Reduces a range of rows
   *
   * Returns a computed single reduced result from a range of rows from the given table.
   * A range consists of consecutive rows from the start key (inclusive) to the stop key (exclusive).
   * You can specify partial keys for the start and stop fields.
   * @access public
   * */
  reduce(body: GdaReduceRequest): Promise<GdaReduceResult> {
    return this.$publish('reduce', body);
  }
  /**
   * Removes one cell inside a column of a row
   *
   * Removes only one cell of the given column of the given row from the given table.
   * @access public
   * */
  removeCell(body: GdaCellRequest): Promise<GdaCellRequest> {
    return this.$publish('removeCell', body);
  }
  /**
   * Removes one full column of a row
   *
   * Removes all cells of the given column of the given row from the given table.
   * @access public
   * */
  removeColumn(body: GdaColumnRequest): Promise<GdaColumnRequest> {
    return this.$publish('removeColumn', body);
  }
  /**
   * Removes a range of rows
   *
   * Removes the specified columns of the given range of rows from the given table.
   * @access public
   * */
  removeRange(body: GdaRemoveRange): Promise<GdaRemoveRange> {
    return this.$publish('removeRange', body);
  }
  /**
   * Removes one full row
   *
   * Removes all columns of the given row from the given table.
   * @access public
   * */
  removeRow(body: GdaRowRequest): Promise<GdaRowRequest> {
    return this.$publish('removeRow', body);
  }
}
