import { Configurer } from '../Core/index';
import { Trigger } from './Trigger';
import { ApiTriggerId, ApiTriggerListener, MassTriggers, TriggerId, TriggerListener } from './TriggerTypes';

/**Register callbacks for events and trigger them when needed.*/
export class TriggerConfigurer extends Configurer {
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
  addApiListener(body: ApiTriggerListener): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Trigger.DEFAULT_DEPLOYMENT_ID,
      'trigger/addApiListener'
    );
  }
  /**
   * Adds a listener
   *
   * Adds or updates a listener for the given event.
   * The listener will be called when the event is triggered.
   * */
  addListener(body: TriggerListener): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Trigger.DEFAULT_DEPLOYMENT_ID,
      'trigger/addListener'
    );
  }
  /**
   * Removes an API listener
   *
   * Removes a previously registered listener for the given API verb.
   * */
  removeApiListener(body: ApiTriggerId): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Trigger.DEFAULT_DEPLOYMENT_ID,
      'trigger/removeApiListener'
    );
  }
  /**
   * Removes a listener
   *
   * Removes a previously registered listener for the given event.
   * */
  removeListener(body: TriggerId): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Trigger.DEFAULT_DEPLOYMENT_ID,
      'trigger/removeListener'
    );
  }
  /**
   * Sets all listeners
   *
   * Sets all listeners in one call.
   * Can remove all previously registered listeners if 'purge' is set to true.
   * */
  setListeners(body: MassTriggers): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Trigger.DEFAULT_DEPLOYMENT_ID,
      'trigger/setListeners'
    );
  }
}
