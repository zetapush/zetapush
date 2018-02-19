import { Service } from '../core/index.js';

/**
 * Data stacks
 *
 * Stacks are a per-user named persistent queue of data
 *  An administrator creates a stack service
 *  End-users can push data on an arbitrary number of their own arbitrary named stacks
 * */
/**
 * Data stack user API
 *
 * Data is stored on a per user basis. However, notifications can be sent to a configurable set of listeners.
 * Stack names are arbitrary and do not need to be explicitly initialized.
 * @access public
 * */
export class Stack extends Service {
  /**
   * Get default deployment id associated to Stack service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'stack_0';
  }
  /**
   * Lists the listeners
   *
   * Returns the whole list of listeners for the given stack.
   * */
  getListeners({ stack, owner }) {
    return this.$publish('getListeners', { stack, owner });
  }
  /**
   * Lists content
   *
   * Returns a paginated list of contents for the given stack.
   * Content is sorted according to the statically configured order.
   * */
  list({ stack, owner, page }) {
    return this.$publish('list', { stack, owner, page });
  }
  /**
   * Empties a stack
   *
   * Removes all items from the given stack.
   * */
  purge({ stack, owner }) {
    return this.$publish('purge', { stack, owner });
  }
  /**
   * Pushes an item
   *
   * Pushes an item onto the given stack.
   * The stack does not need to be created.
   * */
  push({ stack, data, owner }) {
    return this.$publish('push', { stack, data, owner });
  }
  /**
   * Removes items
   *
   * Removes the item with the given guid from the given stack.
   * */
  remove({ guids, stack, owner }) {
    return this.$publish('remove', { guids, stack, owner });
  }
  /**
   * Sets the listeners
   *
   * Sets the listeners for the given stack.
   * */
  setListeners({ listeners, stack, owner }) {
    return this.$publish('setListeners', { listeners, stack, owner });
  }
  /**
   * Updates an item
   *
   * Updates an existing item of the given stack.
   * The item MUST exist prior to the call.
   * */
  update({ guid, stack, data, owner }) {
    return this.$publish('update', { guid, stack, data, owner });
  }
}
