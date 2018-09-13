import { Service } from '../Core/index';
import { AggregationPushes } from './AggregTypes';

/**
 * Data aggregation
 *
 * Provides data aggregation over time and across different items
 *  User devices push items data on developer-defined categories
 *  This service automatically aggregates the data
 * Raw data is not available for reading, only the generated aggregation result
 *
 * */
export class Aggreg extends Service {
  /**
   * Get deployment type associated to Aggreg service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'aggreg';
  }
  /**
   * Get default deployment id associated to Aggreg service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'aggreg_0';
  }
  /**
   * User API for item aggregation
   *
   * Users can push data and be notified of aggregated data.
   * This service does not allow you to read the data. To achieve that kind of behavior, you could configure a callback to store the data.
   * @access public
   * */
  /**
   * Pushes some data
   *
   * Pushes the given data.
   * All the items are processed according to the defined rules.
   * At least one push for a given item is needed during a time period to trigger processing and calling of the corresponding callback verb/macro.
   * @access public
   * */
  push(body: AggregationPushes) {
    this.$publish('push', body);
  }
}
