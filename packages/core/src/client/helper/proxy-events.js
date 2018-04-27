import {
  DEFAULT_MACRO_CHANNEL,
  DEFAULT_TASK_CHANNEL,
} from './cometd-helper.js';
import { ApiError, DEFAULT_ERROR_CHANNEL } from './api-error.js';

export const PROXY_SERVICE = 'proxy_service';
export const PROXY_MACRO_SERVICE = 'proxy_macro_service';
export const PROXY_TASK_SERVICE = 'proxy_task_service';

/**
 * Provide utilities and abstraction to create proxy services
 * @access private
 */
export class ProxyHelper {
  constructor(clientHelper) {
    this.clientHelper = clientHelper;
  }

  /**
   * Handle creation of proxy service
   * @param {*} deploymentId
   * @param {*} type
   */
  handleCreateProxyService(deploymentId, type) {
    if (typeof Proxy === 'undefined') {
      throw new Error('`Proxy` is not support in your environment');
    }
    const prefix = () =>
      `/service/${this.clientHelper.getSandboxId()}/${deploymentId}`;
    return new Proxy(
      {},
      {
        get: (target, method) => {
          switch (type) {
            case PROXY_MACRO_SERVICE:
              return (parameters) =>
                this.createProxyServiceMacroCase(parameters, prefix, method);
              break;
            case PROXY_SERVICE:
              return (parameters) =>
                this.createProxyServiceCase(parameters, prefix, method);
              break;
            case PROXY_TASK_SERVICE:
              return (parameters) =>
                this.getProxyTaskCase(parameters, '', prefix, method);
              break;
          }
        },
      },
    );
  }

  createProxyServiceMacroCase(parameters, prefix, method) {
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
        [method]: handler,
        [DEFAULT_MACRO_CHANNEL]: handler,
      };
      // Ad-Hoc subscription
      this.clientHelper.subscribe(prefix, listener, subscriptions);
      // Publish message on channel
      this.clientHelper.publish(channel, {
        debug: 1,
        hardFail: false,
        name: method,
        parameters,
        requestId: uniqRequestId,
      });
    });
  }

  getProxyTaskCase(parameters = null, namespace = '', prefix, method) {
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
          name: method,
          namespace,
          parameters,
        },
        requestId: uniqRequestId,
      });
    });
  }

  createProxyServiceCase(parameters, prefix, method) {
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
  }
}
