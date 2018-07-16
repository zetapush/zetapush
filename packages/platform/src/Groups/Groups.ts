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
   * User API for groups and rights.
   *
   * Groups are stored per user.
   * This means that two users can own a group with the same identifier. A couple (owner, group) is needed to uniquely identify a group inside a group management service.
   * The triplet (deploymentId, owner, group) is actually needed to fully qualify a group outside of the scope of this service.
   * @access public
   * */
  addMe(body: UserGroup): Promise<UserGroup> {
    return this.$publish('addMe', body);
  }
  addUser(body: UserGroup): Promise<UserGroup> {
    return this.$publish('addUser', body);
  }
  addUsers(body: GroupUsers) {
    return this.$publish('addUsers', body);
  }
  allGroups(body: ImpersonatedRequest): Promise<GroupUsers[]> {
    return this.$publish('allGroups', body);
  }
  check(body: GrantCheckRequest): Promise<GrantCheckResult> {
    return this.$publish('check', body);
  }
  createGroup(body: GroupInfo): Promise<GroupInfo> {
    return this.$publish('createGroup', body);
  }
  delGroup(body: GroupRelated): Promise<GroupRelated> {
    return this.$publish('delGroup', body);
  }
  delUser(body: UserGroup): Promise<UserGroup> {
    return this.$publish('delUser', body);
  }
  delUsers(body: GroupUsers) {
    return this.$publish('delUsers', body);
  }
  exists(body: GroupRelated): Promise<GroupExistence> {
    return this.$publish('exists', body);
  }
  grant(body: Grant): Promise<Grant> {
    return this.$publish('grant', body);
  }
  groupUsers(body: GroupRelated): Promise<GroupUsers> {
    return this.$publish('groupUsers', body);
  }
  groups(body: ImpersonatedRequest): Promise<GroupInfo[]> {
    return this.$publish('groups', body);
  }
  listDetailedOwnedGroups(body: TraceablePaginatedImpersonatedRequest): Promise<OwnedGroupsWithDetails> {
    return this.$publish('listDetailedOwnedGroups', body);
  }
  listGrants(body: GroupRelated): Promise<GrantList> {
    return this.$publish('listGrants', body);
  }
  listGroupGrants(body: GroupRelatedAndPaged): Promise<PagedGrantList> {
    return this.$publish('listGroupGrants', body);
  }
  listGroupPresences(body: GroupRelatedAndPaged): Promise<PagedGroupPresence> {
    return this.$publish('listGroupPresences', body);
  }
  listJoinedGroups(body: TraceablePaginatedImpersonatedRequest): Promise<JoinedGroups> {
    return this.$publish('listJoinedGroups', body);
  }
  listOwnedGroups(body: TraceablePaginatedImpersonatedRequest): Promise<OwnedGroups> {
    return this.$publish('listOwnedGroups', body);
  }
  listPresences(body: GroupRelated): Promise<GroupPresence> {
    return this.$publish('listPresences', body);
  }
  memberOf(body: UserMembership): Promise<UserGroupMembership> {
    return this.$publish('memberOf', body);
  }
  mgrant(body: Grants): Promise<Grants> {
    return this.$publish('mgrant', body);
  }
  mrevoke(body: Grants): Promise<Grants> {
    return this.$publish('mrevoke', body);
  }
  myGroups(body: ImpersonatedRequest): Promise<GroupInfo[]> {
    return this.$publish('myGroups', body);
  }
  revoke(body: Grant): Promise<Grant> {
    return this.$publish('revoke', body);
  }
  /**
   * User API for remote control
   *
   * @access public
   * */
  addListener(body: RemoteCommand) {
    return this.$publish('addListener', body);
  }
  capabilities(body: DeviceCapabilities) {
    return this.$publish('capabilities', body);
  }
  execute(body: RemoteCommand) {
    return this.$publish('execute', body);
  }
  getCapabilities() {
    return this.$publish('getCapabilities');
  }
  notify(body: RemoteCommand) {
    return this.$publish('notify', body);
  }
  ping(body: PingRequest) {
    return this.$publish('ping', body);
  }
  pong(body: DeviceAvailability) {
    return this.$publish('pong', body);
  }
  removeListener(body: RemoteCommand) {
    return this.$publish('removeListener', body);
  }
}
