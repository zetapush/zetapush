import { Configurer } from '../Core/index';
import { Simple } from './Simple';
import { PageContent } from '../CommonTypes';
import { BasicAuthenticatedUser, BasicUserCreation, ExistenceCheck } from './SimpleTypes';

/**Zetapush local authentication. The configurer can choose the primary key and mandatory user fields for account creation. The field 'zetapushKey' is generated by the server and MUST not be used : it contains the unique key of the user inside a sandbox (it can be obtained from inside a macro with the <b>__userKey</b> pseudo-constant)*/
export class SimpleConfigurer extends Configurer {
  /**
   * Administrative API for the simple local authentication
   *
   * These API verbs allow the developer to manage user accounts.
   * */
  /**
   * Creates a user
   *
   * Creates a new user in this 'simple' authentication realm.
   * */
  createUser(body: BasicUserCreation): Promise<BasicAuthenticatedUser> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Simple.DEFAULT_DEPLOYMENT_ID,
      'memauth/createUser'
    );
  }
  /**
   * Deletes a user
   *
   * Deletes a user by locally unique key in this 'simple' authentication realm.
   * */
  deleteUser(body: ExistenceCheck): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Simple.DEFAULT_DEPLOYMENT_ID,
      'memauth/deleteUser'
    );
  }
  /**
   * Lists users
   *
   * Returns a paginated list of the users present in this 'simple' authentication realm.
   * */
  listUsers(): Promise<PageContent<BasicAuthenticatedUser>> {
    return this.$configure(
      null,
      /* TODO value from instance-local variable  */ Simple.DEFAULT_DEPLOYMENT_ID,
      'memauth/listUsers'
    );
  }
}
