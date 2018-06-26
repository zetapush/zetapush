import { Service } from '../core/index';
import { ImpersonatedRequest, Paginable, PageContent } from '../core/types';

type StackData = {
  [property: string]: any;
};

type StackGuid = string;

export interface StackRequest extends ImpersonatedRequest {
  /** Stack name. */
  stack: string;
}

export interface StackItemAddInput extends StackRequest {
  /** Stored data */
  data: StackData;
}

export interface StackItemAddOutput extends StackItemAddInput {
  /** Key of this stack item */
  guid: StackGuid;
}

export interface StackItemRemove extends StackRequest {
  /** List of keys of the items to be removed */
  guids: StackGuid[];
}

export interface StackListRequest extends StackRequest, Paginable {}

export interface StackItem {
  /** Server-generated GUID */
  guid: StackGuid;
  /** Insertion timestamp */
  ts: number;
  /** Stored data */
  data: StackData;
}

export interface StackListResponse extends ImpersonatedRequest {
  /** Request leading to the result */
  request: StackListRequest;
  /** Result for the specified request */
  result: PageContent<StackItem>;
}

export interface StackListeners extends StackRequest {
  /** List of userKeys (as in the value of __userKey) or fully qualified group names (the syntax is groupServiceDeploymentId:userKey:group) that will be notified of modifying stack operations */
  listeners?: string[];
}

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
    return `${Stack.DEPLOYMENT_TYPE}_0`;
  }
  /**
   * Lists the listeners
   *
   * Returns the whole list of listeners for the given stack.
   * */
  getListeners({ stack, owner }: StackRequest): Promise<StackListeners> {
    return this.$publish('getListeners', { stack, owner });
  }
  /**
   * Lists content
   *
   * Returns a paginated list of contents for the given stack.
   * Content is sorted according to the statically configured order.
   * */
  list({ stack, owner, page }: StackListRequest): Promise<StackListResponse> {
    return this.$publish('list', { stack, owner, page });
  }
  /**
   * Empties a stack
   *
   * Removes all items from the given stack.
   * */
  purge({ stack, owner }: StackRequest): Promise<StackRequest> {
    return this.$publish('purge', { stack, owner });
  }
  /**
   * Pushes an item
   *
   * Pushes an item onto the given stack.
   * The stack does not need to be created.
   * */
  push({ stack, data, owner }: StackItemAddInput): Promise<StackItemAddOutput> {
    return this.$publish('push', { stack, data, owner });
  }
  /**
   * Removes items
   *
   * Removes the item with the given guid from the given stack.
   * */
  remove({ guids, stack, owner }: StackItemRemove): Promise<StackItemRemove> {
    return this.$publish('remove', { guids, stack, owner });
  }
  /**
   * Sets the listeners
   *
   * Sets the listeners for the given stack.
   * */
  setListeners({
    listeners,
    stack,
    owner,
  }: StackListeners): Promise<StackListeners> {
    return this.$publish('setListeners', { listeners, stack, owner });
  }
  /**
   * Updates an item
   *
   * Updates an existing item of the given stack.
   * The item MUST exist prior to the call.
   * */
  update({
    guid,
    stack,
    data,
    owner,
  }: StackItemAddOutput): Promise<StackItemAddOutput> {
    return this.$publish('update', { guid, stack, data, owner });
  }
}
