var TRANSPORT_TYPES = require('../TransportTypes');

var FetchLongPollingTransport = require('../FetchLongPollingTransport');
var WebSocketTransport = require('../WebSocketTransport');

// Use node-fetch implementation
exports.fetch = function() {
  return fetch.apply(self, arguments);
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
var ALL = [
  WEBSOCKET_TRANSPORT,
  LONG_POLLING_TRANSPORT
];
exports.ALL = ALL;

/**
 * Get overloaded config from environement
 */
var getOverloadedConfigFromEnvironement = function getOverloadedConfigFromEnvironement() {
  var env = typeof document === 'undefined' ? {} : document.documentElement.dataset;
  var platformUrl = env.zpPlatformUrl;
  var appName = env.zpSandboxid;
  return {
    platformUrl: platformUrl,
    appName: appName
  }
}
exports.getOverloadedConfigFromEnvironement = getOverloadedConfigFromEnvironement;
