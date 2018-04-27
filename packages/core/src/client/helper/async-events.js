import { ApiError, DEFAULT_ERROR_CHANNEL } from './api-error';
import {
  DEFAULT_MACRO_CHANNEL,
  DEFAULT_TASK_CHANNEL,
} from './cometd-helper.js';

export const ASYNC_SERVICE = 'async_service';
export const ASYNC_MACRO_SERVICE = 'async_macro_service';
export const ASYNC_TASK_SERVICE = 'async_task_service';

/**
 * Provide utilities and abstraction to create async services
 * @access private
 */
export class AsyncHelper {
  constructor(clientHelper) {
    this.clientHelper = clientHelper;
  }

  /**
   * Handle creation of async service
   * @param {*} listener
   * @param {*} Type
   * @param {*} deploymentId
   * @param {*} type
   */
  handleCreateAsyncService(listener, Type, deploymentId, type) {
    const prefix = () =>
      `/service/${this.clientHelper.getSandboxId()}/${deploymentId}`;
    let $publish;

    switch (type) {
      case ASYNC_SERVICE:
        $publish = this.getAsyncServicePublisher(prefix);
        break;
      case ASYNC_MACRO_SERVICE:
        $publish = this.getAsyncMacroPublisher(prefix);
        break;
      case ASYNC_TASK_SERVICE:
        $publish = this.getAsyncTaskPublisher(prefix);
        break;
    }

    // Create service by publisher
    return this.clientHelper.createServiceByPublisher({
      listener,
      prefix,
      Type,
      $publish,
    });
  }

  /**
   * Get a publisher for a macro service that return a promise
   * @param {() => string} prefix - Channel prefix
   * @return {Function} publisher
   */
  getAsyncMacroPublisher(prefix) {
    return (name, parameters, hardFail = false, debug = 1) => {
      const channel = `${prefix()}/call`;
      const uniqRequestId = this.clientHelper.getUniqRequestId();
      const subscriptions = {};
      return new Promise((resolve, reject) => {
        const handler = ({ data = {} }) => {
          const { result = {}, errors = [], requestId } = data;
          if (requestId === uniqRequestId) {
            // Handle errors
            if (errors.length > 0) {
              reject(errors);
            } else {
              resolve(result);
            }
            this.clientHelper.unsubscribe(subscriptions);
          }
        };
        // Create dynamic listener method
        const listener = {
          [name]: handler,
          [DEFAULT_MACRO_CHANNEL]: handler,
        };
        // Ad-Hoc subscription
        this.clientHelper.subscribe(prefix, listener, subscriptions);
        // Publish message on channel
        this.clientHelper.publish(channel, {
          debug,
          hardFail,
          name,
          parameters,
          requestId: uniqRequestId,
        });
      });
    };
  }

  /**
   * Get a publisher for a service
   * @param {() => string} prefix - Channel prefix
   * @return {Function} publisher
   */
  getAsyncServicePublisher(prefix) {
    return (method, parameters) => {
      const channel = `${prefix()}/${method}`;
      const uniqRequestId = this.clientHelper.getUniqRequestId();
      const subscriptions = {};
      return new Promise((resolve, reject) => {
        const onError = ({ data = {} }) => {
          const { requestId, code, message } = data;
          if (requestId === uniqRequestId) {
            reject(new ApiError(message, code));
            this.clientHelper.unsubscribe(subscriptions);
          }
        };
        const onSuccess = ({ data = {} }) => {
          const { requestId, ...result } = data;
          if (requestId === uniqRequestId) {
            resolve(result);
            this.clientHelper.unsubscribe(subscriptions);
          }
        };
        // Create dynamic listener method
        const listener = {
          [method]: onSuccess,
          [DEFAULT_ERROR_CHANNEL]: onError,
        };
        // Ad-Hoc subscription
        this.clientHelper.subscribe(prefix, listener, subscriptions);
        // Publish message on channel
        this.clientHelper.publish(channel, {
          ...parameters,
          requestId: uniqRequestId,
        });
      });
    };
  }

  /**
   * Get a publisher for a task service that return a promise
   * @experimental
   * @param {() => string} prefix - Channel prefix
   * @return {Function} publisher
   */
  getAsyncTaskPublisher(prefix) {
    return (name, parameters = null, namespace = '') => {
      const channel = `${prefix()}/${DEFAULT_TASK_CHANNEL}`;
      const uniqRequestId = this.clientHelper.getUniqRequestId();
      const subscriptions = {};
      return new Promise((resolve, reject) => {
        const onError = ({ data = {} }) => {
          const { requestId, code, message } = data;
          if (requestId === uniqRequestId) {
            reject(new ApiError(message, code));
            this.clientHelper.unsubscribe(subscriptions);
          }
        };
        const onSuccess = ({ data = {} }) => {
          const { result = {}, requestId } = data;
          if (requestId === uniqRequestId) {
            resolve(result);
            this.clientHelper.unsubscribe(subscriptions);
          }
        };
        // Create dynamic listener method
        const listener = {
          [DEFAULT_TASK_CHANNEL]: onSuccess,
          [DEFAULT_ERROR_CHANNEL]: onError,
        };
        // Ad-Hoc subscription
        this.clientHelper.subscribe(prefix, listener, subscriptions);
        // Publish message on channel
        this.clientHelper.publish(channel, {
          data: {
            name,
            namespace,
            parameters,
          },
          requestId: uniqRequestId,
        });
      });
    };
  }
}
