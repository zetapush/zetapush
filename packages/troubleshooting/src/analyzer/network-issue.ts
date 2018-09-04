// NodeJS modules
import dns from 'dns';
import os from 'os';
import process from 'process';
// ZetaPush modules
import { trace } from '@zetapush/common';
// Project modules
import { ErrorAnalyzer, ErrorContextToAnalyze, ExitCode } from './error-analyzer';
// ThirdPart modules
const gateway = require('default-gateway');
const execa = require('execa');

export class NetworkIssueAnalyzer extends ErrorAnalyzer {
  async canReachLocalNetwork(err: ErrorContextToAnalyze) {
    return new Promise((resolve, reject) => {
      try {
        const defaultGateway = gateway.v4.sync();
        trace('default gateway', defaultGateway);
        // if the default gateway is the address of the unreachable network
        // => the local network is not accessible
        resolve(defaultGateway.gateway != err.error.address);
      } catch (e) {
        trace('default gateway error', e);
        // fails if there is no result => no defaut gateway => resolve(false)
        // fails if there is another error => reject
        if (e.message != 'Unable to determine default gateway') {
          resolve(false);
        } else {
          reject(e);
        }
      }
    });
  }

  async canReachGoogle() {
    return new Promise((resolve) => {
      dns.lookup('google.com', (failure) => {
        if (failure && failure.code == 'ENOTFOUND') {
          trace('no access to google');
          resolve(false);
        } else {
          trace('access to google');
          resolve(true);
        }
      });
    });
  }

  async canReachProxy(err: ErrorContextToAnalyze) {
    return new Promise((resolve) => {
      const proxy = this.getConfiguredProxy();
      if (proxy) {
        dns.lookupService(proxy, 53, (failure: any) => {
          if (failure) {
            trace('no access to proxy');
            resolve(false);
          } else {
            trace('access to proxy');
            resolve(true);
          }
        });
      } else {
        resolve(true);
      }
    });
  }

  async canAccessDnsServer() {
    return new Promise((resolve) => {
      dns.lookupService('8.8.8.8', 53, (failure: any) => {
        if (failure) {
          trace('no access to external dns server');
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  isNetworkError(err: ErrorContextToAnalyze) {
    if (!err.error || !err.request) {
      return false;
    }
    const code = err.error.code;
    return (
      code == 'EAI_AGAIN' ||
      code == 'ENETUNREACH' ||
      code == 'ETIMEDOUT' ||
      code == 'ECONNRESET' ||
      code == 'ECONNREFUSED' ||
      code == 'EPIPE' ||
      code == 'ENOTFOUND'
    );
  }

  isBehindProxy(err: ErrorContextToAnalyze) {
    const code = err.error && err.error.code;
    return code == 'ENETUNREACH' || (code == 'ECONNREFUSED' && !err.request.url.includes(err.error.address)); // if address different from URL, request goes through a proxy (TODO: is always working?)
  }

  hasActiveExternalNetworkInterface() {
    const interfaces = os.networkInterfaces();
    for (let networkInterface in interfaces) {
      let externalInterfaces = interfaces[networkInterface].filter((n) => !n.internal);
      if (externalInterfaces.length > 0) {
        trace('at least one external interface');
        return true;
      }
    }
    trace('no external interface');
    return false;
  }

  isProxyConfigured() {
    return !!this.getConfiguredProxy() || !!this.getConfiguredNpmProxy();
  }

  getConfiguredProxy() {
    // TODO: handle windows
    // TODO: handle pac
    return process.env.HTTP_PROXY || process.env.http_proxy || process.env.HTTPS_PROXY || process.env.https_proxy;
  }

  getConfiguredNpmProxy() {
    try {
      const proxy = execa.sync('npm', ['config', 'get', 'proxy']);
      return proxy.stdout && proxy.stdout != 'null' ? proxy.stdout : null;
    } catch (e) {
      trace('npm proxy', e);
      return null;
    }
  }

  async getError(err: ErrorContextToAnalyze) {
    // not a network error, let another analyzer handle the error
    if (!this.isNetworkError(err)) {
      trace('not a network error', typeof err, Object.keys(err));
      return null;
    }
    try {
      trace('this is a network error');
      if (!this.hasActiveExternalNetworkInterface() || !(await this.canReachLocalNetwork(err))) {
        trace('local network not available');
        if (this.isProxyConfigured()) {
          trace('a proxy is configured but unreachable');
          return { code: ExitCode.NET_03 };
        }
        trace('no proxy');
        return { code: ExitCode.NET_01 };
      }
      if (!(await this.canAccessDnsServer()) || !(await this.canReachGoogle())) {
        trace('local network available but not internet');
        if (!this.isBehindProxy(err) && !this.isProxyConfigured()) {
          trace('not behind proxy');
          return { code: ExitCode.NET_02 };
        }
        if (!(await this.canReachProxy(err))) {
          trace('behind proxy and proxy not reachable');
          return { code: ExitCode.NET_03 };
        }
        trace('behind proxy and proxy reachable but not internet');
        return { code: ExitCode.NET_04 };
      }
      // TODO: port blocked (-> test citedia)
      return { code: ExitCode.NET_02 };
    } catch (e) {
      trace('failed to determine network cause', e);
      return { code: ExitCode.NET_05 };
    }
  }
}

module.exports = { NetworkIssueAnalyzer };
