var TRANSPORT_TYPES = require('../TransportTypes');

var FetchLongPollingTransport = require('../FetchLongPollingTransport');
var WebSocketTransport = require('../WebSocketTransport');

// Use node-fetch implementation
exports.fetch = function() {
  var context = null;
  if (typeof self !== 'undefined') {
    // Default
    context = self;
  } else if (typeof global !== 'undefined') {
    // React Native
    context = global;
  } else if (typeof window !== 'undefined') {
    // Browser
    context = window;
  } else {
    throw new Error('Unsupported global context object').
  }
  return fetch.apply(context, arguments);
};

// Use node-websocket implementation
exports.WebSocket = typeof WebSocket === 'undefined' ? null : WebSocket;

/**
 * Long polling transport layer
 */
var WEBSOCKET_TRANSPORT = {
  type: TRANSPORT_TYPES.WEBSOCKET,
  Transport: WebSocketTransport,
  parameters: exports.WebSocket
};
exports.WEBSOCKET_TRANSPORT = WEBSOCKET_TRANSPORT;

/**
 * Long polling transport layer
 */
var LONG_POLLING_TRANSPORT = {
  type: TRANSPORT_TYPES.LONG_POLLING,
  Transport: FetchLongPollingTransport,
  parameters: exports.fetch
};
exports.LONG_POLLING_TRANSPORT = LONG_POLLING_TRANSPORT;

/**
 * CometD Transports Layers map
 */
var ALL = [WEBSOCKET_TRANSPORT, LONG_POLLING_TRANSPORT];
exports.ALL = ALL;

/**
 * Get overloaded config from environment
 */
var getOverloadedConfigFromEnvironment = function getOverloadedConfigFromEnvironment() {
  var env = typeof document === 'undefined' ? {} : document.documentElement.dataset;
  var platformUrl = env.zpPlatformUrl;
  var appName = env.zpSandboxid;
  return {
    platformUrl: platformUrl,
    appName: appName
  };
};
exports.getOverloadedConfigFromEnvironment = getOverloadedConfigFromEnvironment;
