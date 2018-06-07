const { ErrorAnalyzer } = require('./troubleshooting');
const dns = require('dns');
const os = require('os');
const { trace, log, error, info, help } = require('../utils/log');

class NetworkIssueAnalyzer extends ErrorAnalyzer {
  async canReachLocalNetwork() {
    return new Promise((resolve, reject) => {
        // TODO        
        resolve(false)
    })
  }
  
  async canReachGoogle() {
    return new Promise((resolve, reject) => {
        dns.lookup('google.com', function(err) {
          if (err && err.code == "ENOTFOUND") {
            trace("no access to google")
            resolve(false)
          } else {
            resolve(true)
          }
      })
    })
  }

  async canReachProxy() {
    return new Promise((resolve, reject) => {
        // TODO
        resolve(false)
    })
  }

  async canAccessDnsServer() {
    return new Promise((resolve, reject) => {
      dns.lookupService('8.8.8.8', 53, function(err, hostname, service) {
        if(err) {
          trace("no access to external dns server")
          resolve(false)
        } else {
          resolve(true)
        }
      })
    })
  }

  isNetworkError(err) {
    return err.code=='EAI_AGAIN' 
          || err.code=='ENETUNREACH' 
          || err.code=='ETIMEDOUT'
          || err.code=='ECONNRESET'
  }

  isBehindProxy(err) {
    return err.code=='ENETUNREACH'
  }

  hasActiveExternalNetworkInterface() {
    const interfaces = os.networkInterfaces()
    for(let networkInterface in interfaces) {
      let externalInterfaces = interfaces[networkInterface].filter((n) => !n.internal)
      if(externalInterfaces.length>0) {
        return true
      }
    }
    trace("no external interface")
    return false
  }

  isProxyConfigured(err) {
    return 
  }

  async getError(err) {
    // not a network error, let another analyzer handle the error
    if(!this.isNetworkError(err)) {
      return null
    }
    if(!this.hasActiveExternalNetworkInterface() || !await this.canReachLocalNetwork()) {
      return {code: 'NET-01'}
    }
    if(!await this.canAccessDnsServer() || !await this.canReachGoogle()) {
      let behindProxy = this.isBehindProxy(err)
      if(!behindProxy) {
        return {code: 'NET-02'}
      }
      if(!await this.canReachProxy()) {
        return {code: 'NET-03'}
      }
      return {code: 'NET-04'}
    }
    return {code: 'NET-02'}
  }
}



module.exports = { NetworkIssueAnalyzer }

