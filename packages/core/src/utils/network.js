import { getSecureUrl, HTTPS_PROTOCOL, HTTP_PROTOCOL } from './http.js';

/**
 * @access private
 * @param {string} apiUrl
 * @return {string}
 */
const normalizeApiUrl = (apiUrl) => {
  const last = apiUrl.charAt(apiUrl.length - 1);
  const SLASH = '/';
  return last === SLASH ? apiUrl : apiUrl + SLASH;
};

/**
 * @access private
 * @param {{apiUrl: string, sandboxId: string, forceHttps: boolean, transports: Transports}} parameters
 * @return {Promise}
 */
export const getSandboxConfig = ({
  apiUrl,
  sandboxId,
  forceHttps,
  transports,
}) => {
  const normalizedSecuresApiUrl = normalizeApiUrl(
    getSecureUrl(apiUrl, forceHttps),
  );
  const url = `${normalizedSecuresApiUrl}${sandboxId}`;
  const options = { protocol: forceHttps ? HTTPS_PROTOCOL : HTTP_PROTOCOL };
  return (
    transports
      .fetch(url, options)
      .then((response) => response.json())
      // TODO: Replace by a server side implementation when available
      .then(({ servers, businessId = sandboxId }) => ({
        sandboxId: businessId,
        servers: servers.map((server) => getSecureUrl(server, forceHttps)),
      }))
  );
};
