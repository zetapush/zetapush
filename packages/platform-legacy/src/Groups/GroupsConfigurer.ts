import { Configurer } from '../Core/index';
import { Groups } from './Groups';
import { PageContent } from '../CommonTypes';
import { GrantList, Grants, GroupInfo, GroupRelated, GroupUsers, UserGroup } from './GroupsTypes';

/**Groups management for users, grants on resources, remote commands on devices. This is where you can configure rights for any resource.*/
export class GroupsConfigurer extends Configurer {
  /**
   * Administrative Group Management
   *
   * You can manage all the groups of all your users from here: create, delete, add users, grant or revoke rights.
   * When using the administrative API, the 'owner' field is mandatory and MUST NOT be null.
   * You also can configure additional things: grants on global groups, using the wildcard '*' as the group's owner.
   * */
  /**
   * Adds a user to a group
   *
   * Adds the given user to given group for the given owner, or for a global group.
   * Addition may fail if the group does not exist.
   * */
  addUser(body: UserGroup): Promise<UserGroup> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Groups.DEFAULT_DEPLOYMENT_ID,
      'groups/addUser'
    );
  }
  /**
   * Lists all the groups
   *
   * Returns the paginated list of all groups.
   * */
  allGroups(): Promise<PageContent<GroupInfo>> {
    return this.$configure(
      null,
      /* TODO value from instance-local variable  */ Groups.DEFAULT_DEPLOYMENT_ID,
      'groups/allGroups'
    );
  }
  /**
   * Creates a group
   *
   * Creates a new group for the given owner, or a global group.
   * Creation may fail if the group already exists or if the group id does not follow the naming rules
   * */
  create(body: GroupInfo): Promise<GroupInfo> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Groups.DEFAULT_DEPLOYMENT_ID,
      'groups/create'
    );
  }
  /**
   * Removes a user from a group
   *
   * Removes the given user from the given group for the given owner, or for a global group.
   * */
  delUser(body: UserGroup): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Groups.DEFAULT_DEPLOYMENT_ID,
      'groups/delUser'
    );
  }
  /**
   * Removes a group
   *
   * Removes an existing group for the given owner, or a global group.
   * */
  deleteGroup(body: GroupRelated): Promise<void> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Groups.DEFAULT_DEPLOYMENT_ID,
      'groups/deleteGroup'
    );
  }
  /**
   * Grants rights to a group
   *
   * Grants the given rights to the given group for the given owner, or for a global group.
   * */
  grant(body: Grants): Promise<Grants> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Groups.DEFAULT_DEPLOYMENT_ID,
      'groups/grant'
    );
  }
  /**
   * Lists the grants for a group
   *
   * Lists all the grants that have been previously given by 'grant' to the given group for the given owner, or for a global group.
   * Listing may fail if the group does not exist.
   * */
  grants(body: GroupRelated): Promise<GrantList> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Groups.DEFAULT_DEPLOYMENT_ID,
      'groups/grants'
    );
  }
  /**
   * Lists the users of a group
   *
   * Lists all the users of the given group for the given owner, or for a global group.
   * Listing may fail if the group does not exist.
   * */
  groupUsers(body: GroupRelated): Promise<GroupUsers> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Groups.DEFAULT_DEPLOYMENT_ID,
      'groups/groupUsers'
    );
  }
  /**
   * Revokes a right for a group
   *
   * Revokes the given rights, previously given with 'grant' to the given group for the given owner, or for a global group.
   * */
  revoke(body: Grants): Promise<Grants> {
    return this.$configure(
      body,
      /* TODO value from instance-local variable  */ Groups.DEFAULT_DEPLOYMENT_ID,
      'groups/revoke'
    );
  }
}
