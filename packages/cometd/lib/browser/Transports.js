var TRANSPORT_TYPES = require('../TransportTypes');

var FetchLongPollingTransport = require('../FetchLongPollingTransport');
var WebSocketTransport = require('../WebSocketTransport');

// Use node-fetch implementation
module.exports.fetch = FetchLongPollingTransport.fetch = function() {
  return fetch.apply(window, arguments);
};

// Use node-websocket implementation
module.exports.WebSocket = WebSocketTransport.WebSocket = typeof WebSocket === 'undefined' ? null : WebSocket;

/**
 * Long polling transport layer
 */
var WEBSOCKET_TRANSPORT = {
  type: TRANSPORT_TYPES.WEBSOCKET,
  Transport: WebSocketTransport
};
module.exports.WEBSOCKET_TRANSPORT = WEBSOCKET_TRANSPORT;

/**
 * Long polling transport layer
 */
var LONG_POLLING_TRANSPORT = {
  type: TRANSPORT_TYPES.LONG_POLLING,
  Transport: FetchLongPollingTransport
};
module.exports.LONG_POLLING_TRANSPORT = LONG_POLLING_TRANSPORT;

/**
 * CometD Transports Layers map
 */
var ALL = [
  WEBSOCKET_TRANSPORT,
  LONG_POLLING_TRANSPORT
];
module.exports.ALL = ALL;
