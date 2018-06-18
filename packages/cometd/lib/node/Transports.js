var TRANSPORT_TYPES = require('../TransportTypes');

var FetchLongPollingTransport = require('../FetchLongPollingTransport');
var WebSocketTransport = require('../WebSocketTransport');

// Use node-fetch implementation
exports.fetch = require('node-fetch');

// Use node-websocket implementation
exports.WebSocket = require('ws/lib/websocket');

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
  var env = process.env;
  var platformUrl = env.ZP_ZBO_URL;
  var appName = env.ZP_SANDBOX_ID;
  return {
    apiUrl: apiUrl,
    appName: appName
  }
}
exports.getOverloadedConfigFromEnvironement = getOverloadedConfigFromEnvironement;
