import { fetch } from './utils/network';
import { Config } from './common-types';
import { BaseError } from './error';

export class AccountNotActive extends BaseError {
  constructor(message: string, public argumentName: string, public argumentValue: string, public cause?: Error) {
    super(message);
  }
}

/**
 * Get prefered cluster
 * @param {Object} config
 */
const getPreferedCluster = (config: Config) =>
  fetch({
    config,
    pathname: 'orga/cluster/list',
    debugName: 'getPreferedCluster'
  }).then((clusters: any[]) => {
    const [cluster] = clusters.filter(({ preferred }) => Boolean(preferred));
    return cluster;
  });
/**
 * Get developer profile info
 * @param {Object} config
 */
const whoami = (config: Config) => fetch({ config, pathname: 'auth/whoami', debugName: 'whoami' });
/**
 * Create business application
 * @param {Object} config
 * @param {Object} orga
 * @param {Object} cluster
 */
const create = (config: Config, me: any, cluster: any) => {
  if (me.status !== 'ACTIVE') {
    throw new AccountNotActive(
      `This account is not active. Please validate it (You have received an email).`,
      'email',
      me.email
    );
  }

  return fetch({
    config,
    method: 'POST',
    pathname: 'orga/business/create',
    body: JSON.stringify({
      orgaId: me.orga.id,
      cluster: cluster.id,
      name: `app@${getNameSuffix()}`,
      description: getDescription()
    }),
    debugName: 'createApplication'
  });
};

export const createApplication = (config: Config) =>
  Promise.all([whoami(config), getPreferedCluster(config)])
    .then(([me, cluster]: any[]) => create(config, me, cluster))
    .then((application: any) => ({
      ...config,
      appName: application.businessId,
      envName: ''
    }));

const getNameSuffix = () => `${new Date().toISOString()}`;

const getDescription = () => `Application created from zeta command line the ${new Date().toUTCString()}`;
