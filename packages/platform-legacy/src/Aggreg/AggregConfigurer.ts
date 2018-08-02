import { Configurer } from '../Core/index';
import { Aggreg } from './Aggreg';
import { AggregationItemCategory } from './AggregTypes';

/**Provides data aggregation over time and across different items. User devices push items data on developer-defined categories. This service automatically aggregates the data.Raw data is not available for reading, only the generated aggregation result.*/
export class AggregConfigurer extends Configurer {
  /**
   * Administrative API for aggregation items
   *
   * Manage your items here.
   * Create, delete and list aggregation items.
   * */
  /**
   * Creates an item
   *
   * Creates or updates an item category definition.
   * Items are aggregated based upon their category configuration.
   * When configuring a category, you specify the aggregation output via a callback. That callback can be configured to make use of the given 'item', 'type', 'category', 'value', 'timestamp' passed at run-time by this aggregation service.<ul> <li>'type' and 'category' are defined by a call to this administrative verb (create). <li>'item' is given in each AggregationPush instance by the caller of the run-time 'push' verb. <li>'value' is computed by this service from various values given by the caller of the run-time 'push' verb. <li>'timestamp' is the number of milliseconds from the epoch, aligned to the start of the current period.</ul>
   * Warning : when you update the configuration of an item, only new data are aggregated with the new configuration.
   * */
  create(body: AggregationItemCategory): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Aggreg.DEFAULT_DEPLOYMENT_ID,
      '/aggreg/create'
    );
  }
}
