const { LogLevel, LogSinkType, Queue } = require('@zetapush/platform-legacy');
const { getVerbosity } = require('@zetapush/common');
const process = require('process');
const axios = require('axios');

const VERBOSE_LOGS_CONFIGURATION = {
  rootLoggerConfig: {
    level: LogLevel.TRACE,
    sinkNames: ['internal', 'realtime']
  },
  sinkConfigs: [
    {
      name: 'internal',
      sinkType: LogSinkType.INTERNAL
    },
    {
      name: 'realtime',
      sinkType: LogSinkType.REAL_TIME
    }
  ],
  loggers: [
    {
      level: LogLevel.DEBUG,
      logger: `${Queue.DEFAULT_DEPLOYMENT_ID}.done`
    }
  ]
};

const DEFAULT_LOGS_CONFIGURATION = {
  sinkConfigs: [{ name: 'default', sinkType: 'INTERNAL' }],
  rootLoggerConfig: { level: 'ERROR', sinkNames: ['default'] }
};

const LogsConfigurations = {
  default: DEFAULT_LOGS_CONFIGURATION,
  verbose: VERBOSE_LOGS_CONFIGURATION
};

/**
 * Set the logs configuration
 * @param {string} sandboxId Unique sandboxId of the application
 * @param {string} developerLogin Login of the developer
 * @param {string} developerPassword Password of the developer
 * @param {any} logsConfiguration Choosen logs configuration,
 * @param {string} platformUrl The url of the used platform
 */
const setLogsConfiguration = async (sandboxId, developerLogin, developerPassword, logsConfiguration, platformUrl) => {
  const confAxiosSandboxStatus = {
    url: `/orga/business/live/${sandboxId}`,
    method: 'get',
    baseURL: `${platformUrl}/zbo`,
    headers: {
      'X-Authorization': JSON.stringify({
        username: developerLogin,
        password: developerPassword
      })
    }
  };
  const { data: statusSandbox } = await axios(confAxiosSandboxStatus);
  const nodeChoosen = Object.keys(statusSandbox.nodes)[0];
  const logsDeploymentId = statusSandbox.nodes[Object.keys(statusSandbox.nodes)[0]].items.logs_0.deploymentId;

  const confAxios = {
    url: '/logs/configure/',
    method: 'post',
    // We get the first node found
    baseURL: `${nodeChoosen}/rest/deployed/${sandboxId}/${logsDeploymentId}`,
    headers: {
      'X-Authorization': JSON.stringify({
        username: developerLogin,
        password: developerPassword
      })
    },
    data: LogsConfigurations[logsConfiguration]
  };

  return await axios(confAxios);
};

/**
 * Get the current logs config
 * @param {string} sandboxId Unique sandboxId of the application
 * @param {string} developerLogin Login of the developer
 * @param {string} developerPassword Password of the developer
 * @param {string} platformUrl The url of the choosen platform
 */
const getCurrentLogsConfig = async (sandboxId, developerLogin, developerPassword, platformUrl) => {
  const confAxiosSandboxStatus = {
    url: `/orga/business/live/${sandboxId}`,
    method: 'get',
    baseURL: `${platformUrl}/zbo`,
    headers: {
      'X-Authorization': JSON.stringify({
        username: developerLogin,
        password: developerPassword
      })
    }
  };
  const { data: statusSandbox } = await axios(confAxiosSandboxStatus);
  const nodeChoosen = Object.keys(statusSandbox.nodes)[0];
  const logsDeploymentId = statusSandbox.nodes[Object.keys(statusSandbox.nodes)[0]].items.logs_0.deploymentId;

  const confAxios = {
    url: '/logs/configuration/',
    method: 'get',
    // We get the first node found
    baseURL: `${nodeChoosen}/rest/deployed/${sandboxId}/${logsDeploymentId}`,
    headers: {
      'X-Authorization': JSON.stringify({
        username: developerLogin,
        password: developerPassword
      })
    }
  };

  return await axios(confAxios);
};

const getCometdLogLevel = () => {
  return process.env.COMETD_LOG_LEVEL
    ? toCometdLevel(process.env.COMETD_LOG_LEVEL)
    : cliVerbosityToCometdLogLevel(getVerbosity());
};

const cliVerbosityToCometdLogLevel = (verbosity) => {
  if (verbosity > 3) {
    return 'debug';
  }
  if (verbosity > 2) {
    return 'info';
  }
  return 'warn';
};

const toCometdLevel = (level) => {
  switch (level) {
    case 'silly':
      return 'debug';
    case 'verbose':
    case 'debug':
    case 'info':
      return 'info';
    default:
      return 'warn';
  }
};

module.exports = { getCometdLogLevel, LogsConfigurations, setLogsConfiguration, getCurrentLogsConfig };
