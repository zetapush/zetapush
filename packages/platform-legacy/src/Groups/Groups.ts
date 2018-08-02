import { Service } from '../Core/index';
import {
  DeviceAvailability,
  DeviceCapabilities,
  Grant,
  GrantCheckRequest,
  GrantCheckResult,
  GrantList,
  Grants,
  GroupExistence,
  GroupInfo,
  GroupPresence,
  GroupRelated,
  GroupRelatedAndPaged,
  GroupUsers,
  ImpersonatedRequest,
  JoinedGroups,
  OwnedGroups,
  OwnedGroupsWithDetails,
  PagedGrantList,
  PagedGroupPresence,
  PingRequest,
  RemoteCommand,
  TraceablePaginatedImpersonatedRequest,
  UserGroup,
  UserGroupMembership,
  UserMembership
} from './GroupsTypes';

/**
 * Groups Management
 *
 * Groups management for users, grants on resources, remote commands on devices
 *  This is where you can configure rights for any resource
 *
 * */
export class Groups extends Service {
  /**
   * Get deployment type associated to Groups service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'groups';
  }
  /**
   * Get default deployment id associated to Groups service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'groups_0';
  }
  /**
   * User API for remote control
   *
   * @access public
   * */
  /**
   * Adds a listener
   *
   * A user requests notifications from a device owned by anyone who granted him the right authorizations.
   * Whenever the device calls 'notify', notifications will be sent to the caller of this verb.
   * @access public
   * */
  addListener(body: RemoteCommand) {
    return this.$publish('addListener', body);
  }
  /**
   * Response to 'getCapabilities'
   *
   * @access public
   * */
  capabilities(body: DeviceCapabilities) {
    return this.$publish('capabilities', body);
  }
  /**
   * Executes a command
   *
   * A user executes a command on a device owned by anyone who granted him the right authorizations.
   * The command is issued on channel 'command'
   * @access public
   * */
  execute(body: RemoteCommand) {
    return this.$publish('execute', body);
  }
  /**
   * Requests capabilities
   *
   * A user requests all his devices for the whole list of their capabilities.
   * Devices are expected to answer on channel 'capabilities'
   * @access public
   * */
  getCapabilities() {
    return this.$publish('getCapabilities');
  }
  /**
   * Notifies of some event
   *
   * A device notifies the registered users/devices on this channel.
   * The server forwards the notification to said users.
   * @access public
   * */
  notify(body: RemoteCommand) {
    return this.$publish('notify', body);
  }
  /**
   * Pings devices
   *
   * A user requests all devices (of all owners) on which he has authorizations to respond on channel 'pong'
   * @access public
   * */
  ping(body: PingRequest) {
    return this.$publish('ping', body);
  }
  /**
   * Response to ping
   *
   * @access public
   * */
  pong(body: DeviceAvailability) {
    return this.$publish('pong', body);
  }
  /**
   * Removes a listener
   *
   * A user stops requesting notifications from a device owned by anyone who granted him the right authorizations
   * @access public
   * */
  removeListener(body: RemoteCommand) {
    return this.$publish('removeListener', body);
  }
  /**
   * User API for groups and rights.
   *
   * Groups are stored per user.
   * This means that two users can own a group with the same identifier. A couple (owner, group) is needed to uniquely identify a group inside a group management service.
   * The triplet (deploymentId, owner, group) is actually needed to fully qualify a group outside of the scope of this service.
   * @access public
   * */
  /**
   * Adds me to a group
   *
   * Adds me (the caller) to a group.
   * This verb exists so that group owners may grant the right to join their groups without granting the right to add other users to those groups.
   * The 'user' field is implicitly set to the current user's key.
   * @access public
   * */
  addMe(body: UserGroup): Promise<UserGroup> {
    return this.$publish('addMe', body);
  }
  /**
   * Adds a user to a group
   *
   * Adds the given user to the given group.
   * Addition may fail if the given group does not already exist.
   * @access public
   * */
  addUser(body: UserGroup): Promise<UserGroup> {
    return this.$publish('addUser', body);
  }
  /**
   * Adds users to a group
   *
   * Users are processed in the given order
   * In case of failure in the middle of a user list, this verb may have succeeded to add the first users, but will not continue processing the end of the list.
   * @access public
   * */
  addUsers(body: GroupUsers) {
    return this.$publish('addUsers', body);
  }
  /**
   * Lists my owned groups, with details
   *
   * Returns the whole list of groups owned by the current user, with their members
   * @access public
   * */
  allGroups(body: ImpersonatedRequest): Promise<GroupUsers[]> {
    return this.$publish('allGroups', body);
  }
  /**
   * Checks an authorization
   *
   * This API checks if the given user has the proper authorizations to perform the given action on the owner's resource.
   * If you give the same value for 'user' and 'owner', the check always passes.
   * @access public
   * */
  check(body: GrantCheckRequest): Promise<GrantCheckResult> {
    return this.$publish('check', body);
  }
  /**
   * Creates a group
   *
   * Creates a group owned by the current user.
   * Group creation may fail if the group already exists.
   * @access public
   * */
  createGroup(body: GroupInfo): Promise<GroupInfo> {
    return this.$publish('createGroup', body);
  }
  /**
   * Removes a group
   *
   * Removes the given group owned by the current user or the given owner.
   * Also removes all grants to that group.
   * @access public
   * */
  delGroup(body: GroupRelated): Promise<GroupRelated> {
    return this.$publish('delGroup', body);
  }
  /**
   * Removes a user from a group
   *
   * @access public
   * */
  delUser(body: UserGroup): Promise<UserGroup> {
    return this.$publish('delUser', body);
  }
  /**
   * Removes users from a group
   *
   * @access public
   * */
  delUsers(body: GroupUsers) {
    return this.$publish('delUsers', body);
  }
  /**
   * Tests for a group's existence
   *
   * Returns whether a group exists or not.
   * @access public
   * */
  exists(body: GroupRelated): Promise<GroupExistence> {
    return this.$publish('exists', body);
  }
  /**
   * Grants a right to a group
   *
   * The granting API does not do any check when storing permissions.
   * In particular when granting rights on a verb and resource of another API, the existence of said verb and resource is not checked.
   * @access public
   * */
  grant(body: Grant): Promise<Grant> {
    return this.$publish('grant', body);
  }
  /**
   * Lists the group users
   *
   * Returns the whole list of users configured inside the given group.
   * @access public
   * */
  groupUsers(body: GroupRelated): Promise<GroupUsers> {
    return this.$publish('groupUsers', body);
  }
  /**
   * Lists my owned groups
   *
   * Returns the whole list of groups owned by the current user
   * @access public
   * */
  groups(body: ImpersonatedRequest): Promise<GroupInfo[]> {
    return this.$publish('groups', body);
  }
  /**
   * Lists my owned groups, with details
   *
   * Returns the whole list of groups owned by the current user, with their members
   * @access public
   * */
  listDetailedOwnedGroups(body: TraceablePaginatedImpersonatedRequest): Promise<OwnedGroupsWithDetails> {
    return this.$publish('listDetailedOwnedGroups', body);
  }
  /**
   * Lists rights for a group
   *
   * This API lists explicitly configured rights.
   * Effective rights include configured rights, implicit rights and inherited rights.
   * @access public
   * */
  listGrants(body: GroupRelated): Promise<GrantList> {
    return this.$publish('listGrants', body);
  }
  /**
   * Lists rights for a group
   *
   * This API lists explicitly configured rights.
   * Effective rights include configured rights, implicit rights and inherited rights.
   * @access public
   * */
  listGroupGrants(body: GroupRelatedAndPaged): Promise<PagedGrantList> {
    return this.$publish('listGroupGrants', body);
  }
  /**
   * Lists presences for a group
   *
   * Returns the list of members of the given groups, along with their actual and current presence on the zetapush server.
   * The current implementation does not include information about the particular devices users are connected with.
   * If a user is connected twice with two different devices, two identical entries will be returned.
   * @access public
   * */
  listGroupPresences(body: GroupRelatedAndPaged): Promise<PagedGroupPresence> {
    return this.$publish('listGroupPresences', body);
  }
  /**
   * Lists the groups I am part of
   *
   * Returns the whole list of groups the current user is part of.
   * Groups may be owned by anyone, including the current user.
   * @access public
   * */
  listJoinedGroups(body: TraceablePaginatedImpersonatedRequest): Promise<JoinedGroups> {
    return this.$publish('listJoinedGroups', body);
  }
  /**
   * Lists my owned groups
   *
   * Returns the whole list of groups owned by the current user
   * @access public
   * */
  listOwnedGroups(body: TraceablePaginatedImpersonatedRequest): Promise<OwnedGroups> {
    return this.$publish('listOwnedGroups', body);
  }
  /**
   * Lists presences for a group
   *
   * Returns the list of members of the given groups, along with their actual and current presence on the zetapush server.
   * The current implementation does not include information about the particular devices users are connected with.
   * If a user is connected twice with two different devices, two identical entries will be returned.
   * @access public
   * */
  listPresences(body: GroupRelated): Promise<GroupPresence> {
    return this.$publish('listPresences', body);
  }
  /**
   * Tests membership
   *
   * Tests whether I (the caller) am a member of the given group.
   * This verb exists so that users can determine if they are part of a group without being granted particular rights.
   * The 'user' field is implicitly set to the current user's key.
   * @access public
   * */
  memberOf(body: UserMembership): Promise<UserGroupMembership> {
    return this.$publish('memberOf', body);
  }
  /**
   * Grants rights to a group
   *
   * Grant several rights at once.
   * @access public
   * */
  mgrant(body: Grants): Promise<Grants> {
    return this.$publish('mgrant', body);
  }
  /**
   * Revokes rights for a group
   *
   * @access public
   * */
  mrevoke(body: Grants): Promise<Grants> {
    return this.$publish('mrevoke', body);
  }
  /**
   * Lists the groups I am part of
   *
   * Returns the whole list of groups the current user is part of.
   * Groups may be owned by anyone, including the current user.
   * @access public
   * */
  myGroups(body: ImpersonatedRequest): Promise<GroupInfo[]> {
    return this.$publish('myGroups', body);
  }
  /**
   * Revokes a right for a group
   *
   * @access public
   * */
  revoke(body: Grant): Promise<Grant> {
    return this.$publish('revoke', body);
  }
}
