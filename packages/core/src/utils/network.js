/**
 * @access private
 * @param {{apiUrl: string, sandboxId: string, forceHttps: boolean, transports: Transports}} parameters
 * @return {Promise}
 */
export const getServers = ({ apiUrl, sandboxId, forceHttps, transports }) => {
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
      .then(({ servers }) =>
        servers.map((server) => getSecureUrl(server, forceHttps)),
      )
  );
};
