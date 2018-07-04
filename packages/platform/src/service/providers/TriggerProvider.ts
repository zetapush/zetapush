import { Provider } from '../Provider';
import { Trigger } from '../Trigger';
import * as zp from '../all_types';

/**Register callbacks for events and trigger them when needed.*/
export class TriggerProvider extends Provider {
  /**
   * Administrative API for trigger management.
   *
   * You can add and remove listeners
   * */
  /**
   * Adds an API listener
   *
   * Adds or updates a listener for the given API verb.
   * The listener will be called when the output of the verb is emitted.
   * */
  async addApiListener(body: zp.ApiTriggerListener): Promise<void> {
    return await this.provide(
      null,
      Trigger.DEFAULT_DEPLOYMENT_ID,
      '/trigger/addApiListener',
    );
  }
  /**
   * Adds a listener
   *
   * Adds or updates a listener for the given event.
   * The listener will be called when the event is triggered.
   * */
  async addListener(body: zp.TriggerListener): Promise<void> {
    return await this.provide(
      null,
      Trigger.DEFAULT_DEPLOYMENT_ID,
      '/trigger/addListener',
    );
  }
  /**
   * Removes an API listener
   *
   * Removes a previously registered listener for the given API verb.
   * */
  async removeApiListener(body: zp.ApiTriggerId): Promise<void> {
    return await this.provide(
      null,
      Trigger.DEFAULT_DEPLOYMENT_ID,
      '/trigger/removeApiListener',
    );
  }
  /**
   * Removes a listener
   *
   * Removes a previously registered listener for the given event.
   * */
  async removeListener(body: zp.TriggerId): Promise<void> {
    return await this.provide(
      null,
      Trigger.DEFAULT_DEPLOYMENT_ID,
      '/trigger/removeListener',
    );
  }
  /**
   * Sets all listeners
   *
   * Sets all listeners in one call.
   * Can remove all previously registered listeners if 'purge' is set to true.
   * */
  async setListeners(body: zp.MassTriggers): Promise<void> {
    return await this.provide(
      null,
      Trigger.DEFAULT_DEPLOYMENT_ID,
      '/trigger/setListeners',
    );
  }
}
