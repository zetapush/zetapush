import { Service } from '../core/index';
import { ImpersonatedRequest, Paginable, PageContent } from '../core/types';

type GdaRowData = {
  [property: string]: any;
};

export interface GdaColumnSpec {
  /** Optional list of cell names */
  key2?: string[];
  /** Mandatory column name */
  column: string;
}

export interface GdaTableRequest extends ImpersonatedRequest {
  /** Table name */
  table: string;
}

export interface GdaFilterRequest extends GdaTableRequest, Paginable {
  /** Optional column/cell specifications of the columns/cells to retrieve */
  columns?: GdaColumnSpec[];
  /** Start row key (inclusive) */
  start?: string;
  /** Stop row key (exclusive) */
  stop?: string;
  /** Boolean predicate. The function must accept one parameter : the current row. The return value must be a boolean. When true, the row is retained, otherwise it is filtered out. */
  function?: Object;
}

export interface GdaFilterResult {
  /** Request leading to the result */
  request: GdaFilterRequest;
  /** Result for the specified request */
  result: PageContent<GdaRowData>;
}

export interface GdaGet extends GdaTableRequest {
  /** Row key */
  key: string;
}

export interface GdaGetResult {
  /** Request leading to the result */
  request: GdaGet;
  /** Result for the specified request */
  result: GdaRowData;
}

export interface GdaCellsRequest extends GdaGet, GdaColumnSpec {}

export interface GdaCellsResult {
  /** Request leading to the result */
  request: GdaCellsRequest;
  /** Result for the specified request */
  result: any;
}

export interface GdaPut extends GdaGet {
  /** Stored data. 64-bit signed integer value interpreted as a delta. This delta increments the specified field. */
  data: any;
  /** Optional cell key inside the column */
  key2?: string;
  /** column name inside the row */
  column: string;
}

export interface GdaPutsRow {
  /** Stored data, as a map of columns to values */
  data: GdaRowData;
  /** Row key */
  key: string;
}

export interface GdaPuts extends GdaTableRequest {
  /** Rows to be inserted */
  rows: GdaPutsRow[];
}

export interface GdaPutsResult extends GdaTableRequest {
  inserted: number;
}

export interface GdaList extends GdaTableRequest, Paginable {
  /** Optional column/cell specifications of the columns/cells to retrieve */
  columns?: GdaColumnSpec[];
}

export interface GdaListResult {
  /** Request leading to the result */
  request: GdaList;
  /** Result for the specified request */
  result: PageContent<GdaRowData>;
}

export interface GdaMultiGetRequest extends GdaTableRequest {
  /** Optional column/cell specifications of the columns/cells to retrieve */
  columns?: GdaColumnSpec[];
  /** List of wanted row keys */
  keys: string[];
}

export interface GdaMultiGetResult {
  /** Request leading to the result */
  request: GdaMultiGetRequest;
  /** Result for the specified request */
  result: GdaRowData[];
}

export interface GdaRange extends GdaTableRequest, Paginable {
  /** Optional column/cell specifications of the columns/cells to retrieve */
  columns?: GdaColumnSpec[];
  /** Start row key (inclusive) */
  start: string;
  /** Stop row key (exclusive) */
  stop: string;
}

export interface GdaRangeResult {
  /** Request leading to the result */
  request: GdaRange;
  /** Result for the specified request */
  result: PageContent<GdaRowData>;
}

export interface GdaColumnRequest extends GdaTableRequest {
  /** Row key */
  key: string;
  /** Column name inside the row */
  column: string;
}

export interface GdaCellRequest extends GdaColumnRequest {
  /** Cell key inside the column */
  key2: string;
}

export interface GdaRemoveRange extends GdaRange {}

export interface GdaRowRequest extends GdaGet {}

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
    return `${Gda.DEPLOYMENT_TYPE}_0`;
  }
  /**
   * Similar to range, but rows can be filtered out according to a developer-supplied predicate.
   * A range consists of consecutive rows from the start key (inclusive) to the stop key (exclusive).
   * You can specify partial keys for the start and stop fields.
   * */
  filter(parameters: GdaFilterRequest): Promise<GdaFilterResult> {
    return this.$publish('filter', parameters);
  }
  /**
   * Asks for a data row
   *
   * Returns a full data row.
   * */
  get({ table, key, owner }: GdaGet): Promise<GdaGetResult> {
    return this.$publish('get', { table, key, owner });
  }
  /**
   * Asks for a data cell
   *
   * Returns a precise list of cells from a column in a data row.
   * */
  getCells({
    table,
    key,
    key2,
    owner,
    column,
  }: GdaCellsRequest): Promise<GdaCellsResult> {
    return this.$publish('getCells', { table, key, key2, owner, column });
  }
  /**
   * Increments an integer value
   *
   * Increments a cell 64-bit signed integer value and returns the result in the data field.
   * The increment is atomic : if you concurrently increment 10 times a value by 1, the final result will be the initial value plus 10. The actual individual resulting values seen by the 10 concurrent callers may vary discontinuously, with duplicates : at least one of them will see the final (+10) result.
   * */
  inc({ table, data, key, key2, owner, column }: GdaPut): Promise<GdaPut> {
    return this.$publish('inc', { table, data, key, key2, owner, column });
  }
  /**
   * Asks for a list of rows
   *
   * Returns a paginated list of rows from the given table.
   * */
  list({ columns, table, owner, page }: GdaList): Promise<GdaListResult> {
    return this.$publish('list', { columns, table, owner, page });
  }
  /**
   * Returns full data rows, in the order they were asked..
   * */
  mget({
    columns,
    table,
    keys,
    owner,
  }: GdaMultiGetRequest): Promise<GdaMultiGetResult> {
    return this.$publish('mget', { columns, table, keys, owner });
  }
  /**
   * Puts some data into a cell
   *
   * Creates or replaces the contents of a particular cell.
   * */
  put({ table, data, key, key2, owner, column }: GdaPut): Promise<GdaPut> {
    return this.$publish('put', { table, data, key, key2, owner, column });
  }
  /**
   * Puts several rows
   *
   * Creates or replaces the (maybe partial) contents of a collection of rows.
   * This method only creates or replaces cells for non-null input values.
   * */
  puts({ rows, table, owner }: GdaPuts): Promise<GdaPutsResult> {
    return this.$publish('puts', { rows, table, owner });
  }
  /**
   * Asks for a range of rows
   *
   * Returns a paginated range of rows from the given table.
   * A range consists of consecutive rows from the start key (inclusive) to the stop key (exclusive).
   * You can specify partial keys for the start and stop fields.
   * */
  range({
    columns,
    start,
    table,
    stop,
    owner,
    page,
  }: GdaRange): Promise<GdaRangeResult> {
    return this.$publish('range', { columns, start, table, stop, owner, page });
  }
  /**
   * Removes one cell inside a column of a row
   *
   * Removes only one cell of the given column of the given row from the given table.
   * */
  removeCell({
    table,
    key,
    key2,
    owner,
    column,
  }: GdaCellRequest): Promise<GdaCellRequest> {
    return this.$publish('removeCell', { table, key, key2, owner, column });
  }
  /**
   * Removes one full column of a row
   *
   * Removes all cells of the given column of the given row from the given table.
   * */
  removeColumn({
    table,
    key,
    owner,
    column,
  }: GdaColumnRequest): Promise<GdaColumnRequest> {
    return this.$publish('removeColumn', { table, key, owner, column });
  }
  /**
   * Removes a range of rows
   *
   * Removes the specified columns of the given range of rows from the given table.
   * */
  removeRange({
    columns,
    start,
    table,
    stop,
    owner,
  }: GdaRemoveRange): Promise<GdaRemoveRange> {
    return this.$publish('removeRange', { columns, start, table, stop, owner });
  }
  /**
   * Removes one full row
   *
   * Removes all columns of the given row from the given table.
   * */
  removeRow({ table, key, owner }: GdaRowRequest): Promise<GdaRowRequest> {
    return this.$publish('removeRow', { table, key, owner });
  }
}
