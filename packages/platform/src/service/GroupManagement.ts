import { Service } from '../core/index';
import { Impersonable, UserKey, Resource } from '../core/types';

export interface GroupRelated extends Impersonable {
  /** Group id. Must be alphanumerical. You MAY use the wildcard '*' when granting rights. */
  group: string;
}

export interface GroupInfo extends GroupRelated {
  /** Group name, as displayed to the user */
  groupName: string;
}

export interface GroupUsers extends GroupInfo {
  /** User keys of the group members */
  users: UserKey[];
}

export interface UserGroup extends GroupRelated {
  /** The user's key (as in __userKey). */
  user: UserKey;
}

export interface GroupExistence extends GroupInfo {
  /** Existence of the group */
  exists: boolean;
}

export interface UserGroup extends GroupRelated {
  /** The user's key (as in __userKey) */
  user: UserKey;
}

export interface UserMembership extends GroupRelated {
  /** True if lack of effective membership should be treated as an error. False to return the information as a boolean in the response. */
  hardFail: boolean;
}

export interface UserGroupMembership extends UserGroup {
  /** Whether the user is member of the group */
  member: boolean;
}

export interface Grant extends GroupRelated {
  /** Resource on which the grant applies. For API defined resources, it often has the syntax deploymentId:owner:preciseResource. For example to give access to a gda table, it may look like 'WxzV:wshwWSDOJSD:myTable' , WxzV being the gda deploymentId, wshwWSDOJSD the data owner, and myTable the table to be shared. For grants on user devices, it can match the resource field used during authentication. You can use the wildcard '*' */
  resource: Resource;
  /** Action which will be authorized. For built-in API verbs, it is often the verb itself. You can use the wildcard '*' */
  action: string;
}

export interface Grants extends GroupRelated {
  /** Resource on which the grant applies. For API defined resources, it often has the syntax deploymentId:owner:preciseResource. For example to give access to a gda table, it may look like 'WxzV:wshwWSDOJSD:myTable' , WxzV being the gda deploymentId, wshwWSDOJSD the data owner, and myTable the table to be shared. For grants on user devices, it can match the resource field used during authentication. You can use the wildcard '*' */
  resource: Resource;
  /** Actions which will be authorized. For built-in API verbs, it is often the verb itself. You can use the wildcard '*' */
  actions: string[];
}

/**
 * User API for groups and rights.
 *
 * Groups are stored per user.
 * This means that two users can own a group with the same identifier. A couple (owner, group) is needed to uniquely identify a group inside a group management service.
 * The triplet (deploymentId, owner, group) is actually needed to fully qualify a group outside of the scope of this service.
 * @access public
 * */
export class GroupManagement extends Service {
  /**
   * Get deployment type associated to GroupManagement service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'groups';
  }
  /**
   * Get default deployment id associated to GroupManagement service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return `${GroupManagement.DEPLOYMENT_TYPE}_0`;
  }
  /**
   * Adds me to a group
   *
   * Adds me (the caller) to a group.
   * This verb exists so that group owners may grant the right to join their groups without granting the right to add other users to those groups.
   * The 'user' field is implicitly set to the current user's key.
   * */
  addMe({ group, owner }: UserGroup): Promise<UserGroup> {
    return this.$publish('addMe', { group, owner });
  }
  /**
   * Adds a user to a group
   *
   * Adds the given user to the given group.
   * Addition may fail if the given group does not already exist.
   * */
  addUser({ user, group, owner }: UserGroup): Promise<UserGroup> {
    return this.$publish('addUser', { user, group, owner });
  }
  /**Adds users to a group*/
  addUsers({ users, group, owner }: GroupUsers): Promise<UserGroup> {
    return this.$publish('addUsers', { users, group, owner });
  }
  /**
   * Lists my owned groups, with details
   *
   * Returns the whole list of groups owned by the current user, with their members
   * */
  allGroups({ owner }: Impersonable) {
    return this.$publish('allGroups', { owner });
  }
  /**
   * Creates a group
   *
   * Creates a group owned by the current user.
   * Group creation may fail if the group already exists.
   * */
  createGroup({ group, groupName, owner }: GroupInfo): Promise<GroupInfo> {
    return this.$publish('createGroup', { group, groupName, owner });
  }
  /**
   * Removes a group
   *
   * Removes the given group owned by the current user or the given owner.
   * Also removes all grants to that group.
   * */
  delGroup({ group, owner }: GroupRelated): Promise<GroupRelated> {
    return this.$publish('delGroup', { group, owner });
  }
  /**Removes a user from a group*/
  delUser({ user, group, owner }: UserGroup): Promise<UserGroup> {
    return this.$publish('delUser', { user, group, owner });
  }
  /**Removes users from a group*/
  delUsers({ users, group, groupName, owner }: GroupUsers): Promise<void> {
    return this.$publish('delUsers', { users, group, groupName, owner });
  }
  /**
   * Tests for a group's existence
   *
   * Returns whether a group exists or not.
   * */
  exists({ group, owner }: GroupRelated): Promise<GroupExistence> {
    return this.$publish('exists', { group, owner });
  }
  /**
   * Grants a right to a group
   *
   * The granting API does not do any check when storing permissions.
   * In particular when granting rights on a verb and resource of another API, the existence of said verb and resource is not checked.
   * */
  grant({ resource, group, owner, action }: Grant): Promise<Grant> {
    return this.$publish('grant', { resource, group, owner, action });
  }
  /**
   * Lists the group users
   *
   * Returns the whole list of users configured inside the given group.
   * */
  groupUsers({ group, owner }: GroupRelated): Promise<GroupUsers> {
    return this.$publish('groupUsers', { group, owner });
  }
  /**
   * Lists my owned groups
   *
   * Returns the whole list of groups owned by the current user
   * */
  groups({ owner }: Impersonable): Promise<GroupInfo[]> {
    return this.$publish('groups', { owner });
  }
  /**
   * Lists rights for a group
   *
   * This API lists explicitly configured rights.
   * Effective rights include configured rights, implicit rights and inherited rights.
   * */
  listGrants({ group, owner }) {
    return this.$publish('listGrants', { group, owner });
  }
  /**
   * Lists presences for a group
   *
   * Returns the list of members of the given groups, along with their actual and current presence on the zetapush server.
   * The current implementation does not include information about the particular devices users are connected with.
   * If a user is connected twice with two different devices, two identical entries will be returned.
   * */
  listPresences({ group, owner }: GroupRelated) {
    return this.$publish('listPresences', { group, owner });
  }
  /**
   * Tests membership
   *
   * Tests whether I (the caller) am a member of the given group.
   * This verb exists so that users can determine if they are part of a group without being granted particular rights.
   * The 'user' field is implicitly set to the current user's key.
   * */
  memberOf({
    hardFail,
    group,
    owner,
  }: UserMembership): Promise<UserGroupMembership> {
    return this.$publish('memberOf', { hardFail, group, owner });
  }
  /**
   * Grants rights to a group
   *
   * Grant several rights at once.
   * */
  mgrant({ resource, actions, group, owner }: Grants): Promise<Grants> {
    return this.$publish('mgrant', { resource, actions, group, owner });
  }
  /**Revokes rights for a group*/
  mrevoke({ resource, actions, group, owner }: Grants): Promise<Grants> {
    return this.$publish('mrevoke', { resource, actions, group, owner });
  }
  /**
   * Lists the groups I am part of
   *
   * Returns the whole list of groups the current user is part of.
   * Groups may be owned by anyone, including the current user.
   * */
  myGroups({ owner }: Impersonable): Promise<GroupInfo> {
    return this.$publish('myGroups', { owner });
  }
  /**Revokes a right for a group*/
  revoke({ resource, group, owner, action }: Grant): Promise<Grant> {
    return this.$publish('revoke', { resource, group, owner, action });
  }
}
