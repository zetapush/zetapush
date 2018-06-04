import { getSecureUrl, HTTPS_PROTOCOL, HTTP_PROTOCOL } from './http.js';

/**
 * @access private
 * @param {string} platformUrl
 * @return {string}
 */
const normalizePlatformUrl = (platformUrl) => {
  const last = platformUrl.charAt(platformUrl.length - 1);
  const SLASH = '/';
  return last === SLASH ? platformUrl : platformUrl + SLASH;
};

/**
 * @access private
 * @param {{platformUrl: string, appName: string, forceHttps: boolean, transports: Transports}} parameters
 * @return {Promise}
 */
export const getSandboxConfig = ({
  platformUrl,
  appName,
  forceHttps,
  transports,
}) => {
  const normalizedSecuresPlatformUrl = normalizePlatformUrl(
    getSecureUrl(platformUrl, forceHttps),
  );
  const url = `${normalizedSecuresPlatformUrl}${appName}`;
  const options = { protocol: forceHttps ? HTTPS_PROTOCOL : HTTP_PROTOCOL };
  return (
    transports
      .fetch(url, options)
      .then((response) => response.json())
      // TODO: Replace by a server side implementation when available
      .then(({ servers, businessId = appName }) => ({
        appName: businessId,
        servers: servers.map((server) => getSecureUrl(server, forceHttps)),
      }))
  );
};
