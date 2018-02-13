import { Delegating, Simple, Weak } from '../mapping/authentications';

/**
 * ZetaPush deployables names
 */
const DeployableNames = {
  AUTH_SIMPLE: 'simple',
  AUTH_WEAK: 'weak',
  AUTH_DELEGATING: 'delegating',
  AUTH_DEVELOPER: 'developer',
};

/**
 * Provide abstraction over CometD handshake data structure
 * @access protected
 */
class AbstractHandshake {
  /**
   * Create a new handshake manager
   * @param {{authType: string, sandboxId: string, deploymentId: string}} parameters
   */
  constructor({ authType, sandboxId, deploymentId }) {
    /**
     * @access protected
     * @type {string}
     */
    this.authType = authType;
    /**
     * @access protected
     * @type {string}
     */
    this.sandboxId = sandboxId;
    /**
     * @access protected
     * @type {string}
     */
    this.deploymentId = deploymentId;
  }
  /**
   * @param {ClientHelper} client
   * @return {Object}
   */
  getHandshakeFields(client) {
    const authentication = {
      data: this.authData,
      type: `${client.getSandboxId()}.${this.deploymentId}.${this.authType}`,
      version: this.authVersion,
    };
    if (client.getResource()) {
      authentication.resource = client.getResource();
    }
    return {
      ext: {
        authentication,
      },
    };
  }
  /**
   * Get auth version
   * @return {string}
   */
  get authVersion() {
    return 'none';
  }
}

/**
 * Provide abstraction over CometD token base handshake data structure
 * @access protected
 * @extends {AbstractHandshake}
 */
class TokenHandshake extends AbstractHandshake {
  /**
   * @param {{authType: string, deploymentId: string, token: string}} parameters
   */
  constructor({ authType, deploymentId, token }) {
    super({
      deploymentId,
      authType,
    });
    /**
     * @access private
     * @type {string}
     */
    this.token = token;
  }
  /**
   * @return {token: string}
   */
  get authData() {
    const { token } = this;
    return {
      token,
    };
  }
}

/**
 * Provide abstraction over CometD credentials based handshake data structure
 * @access protected
 * @extends {AbstractHandshake}
 */
class CredentialsHandshake extends AbstractHandshake {
  /**
   * @param {{authType: string, deploymentId: string, login: string, password: string}} parameters
   */
  constructor({ authType, deploymentId, login, password }) {
    super({
      authType,
      deploymentId,
    });
    /**
     * @access private
     * @type {string}
     */
    this.login = login;
    /**
     * @access private
     * @type {string}
     */
    this.password = password;
  }
  /**
   * Get auth data
   * @return {login: string, password: string}
   */
  get authData() {
    const { login, password } = this;
    return {
      login,
      password,
    };
  }
}

/**
 * Factory to create handshake
 * @access public
 */
export class Authentication {
  /**
   * @param {{deploymentId: string, login: string, password: string}} parameters
   * @return {CredentialsHandshake}
   * @example
   * // Explicit deploymentId
   * // Authentication provide optional deployment id, according to the following convention `${ServiceType.toLowerCase()_0}`
   * Authentication.delegating({
   *   deploymentId: '<YOUR-SIMPLE-AUTHENTICATION-DEPLOYMENT-ID>',
   *   login: <USER-LOGIN>,
   *   password: '<USER-PASSWORD>'
   * })
   */
  static simple({
    deploymentId = Simple.DEFAULT_DEPLOYMENT_ID,
    login,
    password,
  }) {
    return Authentication.create({
      authType: DeployableNames.AUTH_SIMPLE,
      deploymentId,
      login,
      password,
    });
  }
  /**
   * @param {{deploymentId: string, token: string}} parameters
   * @return {TokenHandshake}
   * @example
   * // Explicit deploymentId
   * // Authentication provide optional deployment id, according to the following convention `${ServiceType.toLowerCase()_0}`
   * Authentication.delegating({
   *   deploymentId: '<YOUR-WEAK-AUTHENTICATION-DEPLOYMENT-ID>',
   *   token: null
   * })
   */
  static weak({ deploymentId = Weak.DEFAULT_DEPLOYMENT_ID, token }) {
    return Authentication.create({
      authType: DeployableNames.AUTH_WEAK,
      deploymentId,
      login: token,
      password: null,
    });
  }
  /**
   * @param {{deploymentId: string, token: string}} parameters
   * @return {TokenHandshake}
   * @example
   * // Explicit deploymentId
   * // Authentication provide optional deployment id, according to the following convention `${ServiceType.toLowerCase()_0}`
   * Authentication.delegating({
   *   deploymentId: '<YOUR-DELEGATING-AUTHENTICATION-DEPLOYMENT-ID>',
   *   token: null
   * })
   */
  static delegating({
    deploymentId = Delegating.DEFAULT_DEPLOYMENT_ID,
    token,
  }) {
    return Authentication.create({
      authType: DeployableNames.AUTH_DELEGATING,
      deploymentId,
      login: token,
      password: null,
    });
  }
  static developer({ login, password }) {
    return Authentication.create({
      authType: DeployableNames.AUTH_DEVELOPER,
      deploymentId: DeployableNames.AUTH_DEVELOPER,
      login,
      password,
    });
  }
  /**
   * @param {{authType: string, deploymentId: string, login: string, password: string}} parameters
   * @return {TokenHandshake|CredentialsHandshake}
   */
  static create({ authType, deploymentId, login, password }) {
    if (password === null) {
      return new TokenHandshake({
        authType,
        deploymentId,
        token: login,
      });
    }
    return new CredentialsHandshake({
      authType,
      deploymentId,
      login,
      password,
    });
  }
}
