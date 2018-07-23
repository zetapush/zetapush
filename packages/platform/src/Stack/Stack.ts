import { Service } from '../Core';
import {
  StackItemAdd,
  StackItemRemove,
  StackListRequest,
  StackListResponse,
  StackListeners,
  StackRequest
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
  getListeners(body: StackRequest): Promise<StackListeners> {
    return this.$publish('getListeners', body);
  }
  list(body: StackListRequest): Promise<StackListResponse> {
    return this.$publish('list', body);
  }
  purge(body: StackRequest): Promise<StackRequest> {
    return this.$publish('purge', body);
  }
  push(body: StackItemAdd): Promise<StackItemAdd> {
    return this.$publish('push', body);
  }
  remove(body: StackItemRemove): Promise<StackItemRemove> {
    return this.$publish('remove', body);
  }
  setListeners(body: StackListeners): Promise<StackListeners> {
    return this.$publish('setListeners', body);
  }
  update(body: StackItemAdd): Promise<StackItemAdd> {
    return this.$publish('update', body);
  }
}
