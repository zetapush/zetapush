/**
 * Match unsecure pattern web
 * @type {RegExp}
 */
const HTTP_PATTERN = /^http:\/\/|^\/\//;

/**
 * Http protocol
 * @type {string}
 */
export const HTTP_PROTOCOL = 'http:';

/**
 * Https protocol
 * @type {string}
 */
export const HTTPS_PROTOCOL = 'https:';

/**
 * Default ZetaPush API URL
 * @access private
 */
export const API_URL = 'https://celtia.zetapush.com/zbo/pub/business';

/**
 * Force ssl based protocol for network echange
 * Cross Env (Browser/Node) test
 * @access private
 * @type boolean
 */
export const FORCE_HTTPS = typeof location === 'undefined' ? false : location.protocol === HTTPS_PROTOCOL;

/**
 * @access private
 * @param {string} url
 * @param {boolean} forceHttps
 * @return {string}
 */
export const getSecureUrl = (url, forceHttps) => {
  return forceHttps ? url.replace(HTTP_PATTERN, `${HTTPS_PROTOCOL}//`) : url;
};
