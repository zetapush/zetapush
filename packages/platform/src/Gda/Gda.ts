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
  GdaRowRequest
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
  filter(body: GdaFilterRequest): Promise<GdaFilterResult> {
    return this.$publish('filter', body);
  }
  get(body: GdaGet): Promise<GdaGetResult> {
    return this.$publish('get', body);
  }
  getCells(body: GdaCellsRequest): Promise<GdaCellsResult> {
    return this.$publish('getCells', body);
  }
  inc(body: GdaPut): Promise<GdaPut> {
    return this.$publish('inc', body);
  }
  list(body: GdaList): Promise<GdaListResult> {
    return this.$publish('list', body);
  }
  mget(body: GdaMultiGetRequest): Promise<GdaMultiGetResult> {
    return this.$publish('mget', body);
  }
  put(body: GdaPut): Promise<GdaPut> {
    return this.$publish('put', body);
  }
  puts(body: GdaPuts): Promise<GdaPutsResult> {
    return this.$publish('puts', body);
  }
  range(body: GdaRange): Promise<GdaRangeResult> {
    return this.$publish('range', body);
  }
  reduce(body: GdaReduceRequest): Promise<GdaReduceResult> {
    return this.$publish('reduce', body);
  }
  removeCell(body: GdaCellRequest): Promise<GdaCellRequest> {
    return this.$publish('removeCell', body);
  }
  removeColumn(body: GdaColumnRequest): Promise<GdaColumnRequest> {
    return this.$publish('removeColumn', body);
  }
  removeRange(body: GdaRemoveRange): Promise<GdaRemoveRange> {
    return this.$publish('removeRange', body);
  }
  removeRow(body: GdaRowRequest): Promise<GdaRowRequest> {
    return this.$publish('removeRow', body);
  }
}
