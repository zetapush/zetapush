var TRANSPORT_TYPES = require('../TransportTypes');

var FetchLongPollingTransport = require('../FetchLongPollingTransport');
var WebSocketTransport = require('../WebSocketTransport');

// Use node-fetch implementation
exports.fetch = require('node-fetch');

// Use node-websocket implementation
exports.WebSocket = require('ws/lib/websocket');

// Handle System proxy settings if any
var proxy = process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY;
if (proxy) {
  var url = require('url');
  var HttpsProxyAgent = require('https-proxy-agent');
  var options = url.parse(proxy);
  var agent = new HttpsProxyAgent(options);

  class ProxifiedWebSocket extends exports.WebSocket {
    constructor(address, protocols, options) {
      super(address, protocols, { agent });
    }
  }
  exports.ProxifiedWebSocket = ProxifiedWebSocket;
}

/**
 * Long polling transport layer
 */
var WEBSOCKET_TRANSPORT = {
  type: TRANSPORT_TYPES.WEBSOCKET,
  Transport: WebSocketTransport,
  parameters: exports.ProxifiedWebSocket || exports.WebSocket
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
  var env = process.env;
  var platformUrl = env.ZP_ZBO_URL;
  var appName = env.ZP_SANDBOX_ID;
  return {
    platformUrl: platformUrl,
    appName: appName
  };
};
exports.getOverloadedConfigFromEnvironment = getOverloadedConfigFromEnvironment;
