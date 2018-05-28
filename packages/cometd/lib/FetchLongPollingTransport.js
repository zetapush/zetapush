var Transport = require('./Transport')
var LongPollingTransport = require('./LongPollingTransport')

/**
 * Implements LongPollingTransport using fetch() API
 * @access private
 * @param {Function} fetch
 * @return {FetchLongPollingTransport}
 */
function FetchLongPollingTransport(fetch) {
  var _super = new LongPollingTransport()
  var that = Transport.derive(_super)

  /**
   * Implements transport via fetch() API
   * @param {Object} packet
   */
  that.xhrSend = function (packet) {
    fetch(packet.url, {
      method: 'post',
      body: packet.body,
      headers: Object.assign(packet.headers, {
        'Content-Type': 'application/json;charset=UTF-8'
      })
    })
    .then(function (response) {
      return response.json()
    })
    .then(packet.onSuccess)
    .catch(packet.onError)
  }

  return that
}

// Export FetchLongPollingTransport
module.exports = FetchLongPollingTransport;
