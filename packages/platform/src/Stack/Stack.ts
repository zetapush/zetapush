import { Service } from '../Core/index';
import {
  StackItemAdd,
  StackItemRemove,
  StackListRequest,
  StackListResponse,
  StackListeners,
  StackRequest,
} from './StackTypes';

/**
 * Data stacks
 *
 * Stacks are a per-user named persistent queue of data
 *  An administrator creates a stack service
 *  End-users can push data on an arbitrary number of their own arbitrary named stacks
 * */
export class Stack extends Service {
  /**
   * Get deployment type associated to Stack service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'stack';
  }
  /**
   * Get default deployment id associated to Stack service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'stack_0';
  }
  /**
   * Data stack user API
   *
   * Data is stored on a per user basis. However, notifications can be sent to a configurable set of listeners.
   * Stack names are arbitrary and do not need to be explicitly initialized.
   * @access public
   * */
  /**
   * Lists the listeners
   *
   * Returns the whole list of listeners for the given stack.
   * @access public
   * */
  getListeners(body: StackRequest): Promise<StackListeners> {
    return this.$publish('getListeners', body);
  }
  /**
   * Lists content
   *
   * Returns a paginated list of contents for the given stack.
   * Content is sorted according to the statically configured order.
   * @access public
   * */
  list(body: StackListRequest): Promise<StackListResponse> {
    return this.$publish('list', body);
  }
  /**
   * Empties a stack
   *
   * Removes all items from the given stack.
   * @access public
   * */
  purge(body: StackRequest): Promise<StackRequest> {
    return this.$publish('purge', body);
  }
  /**
   * Pushes an item
   *
   * Pushes an item onto the given stack.
   * The stack does not need to be created.
   * @access public
   * */
  push(body: StackItemAdd): Promise<StackItemAdd> {
    return this.$publish('push', body);
  }
  /**
   * Removes items
   *
   * Removes the item with the given guid from the given stack.
   * @access public
   * */
  remove(body: StackItemRemove): Promise<StackItemRemove> {
    return this.$publish('remove', body);
  }
  /**
   * Sets the listeners
   *
   * Sets the listeners for the given stack.
   * @access public
   * */
  setListeners(body: StackListeners): Promise<StackListeners> {
    return this.$publish('setListeners', body);
  }
  /**
   * Updates an item
   *
   * Updates an existing item of the given stack.
   * The item MUST exist prior to the call.
   * @access public
   * */
  update(body: StackItemAdd): Promise<StackItemAdd> {
    return this.$publish('update', body);
  }
}
