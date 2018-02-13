import { Service } from './core';
/**
 * Data aggregation
 *
 * Provides data aggregation over time and across different items
 *  User devices push items data on developer-defined categories
 *  This service automatically aggregates the data
 * Raw data is not available for reading, only the generated aggregation result
 *
 * */
/**
 * User API for item aggregation
 *
 * Users can push data and be notified of aggregated data.
 * This service does not allow you to read the data. To achieve that kind of behavior, you could configure a callback to store the data.
 * @access public
 * */
export class Aggreg extends Service {
  /**
   * Get default deployment id associated to Aggreg service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'aggreg_0';
  }
  /**
   * Pushes some data
   *
   * Pushes the given data.
   * All the items are processed according to the defined rules.
   * At least one push for a given item is needed during a time period to trigger processing and calling of the corresponding callback verb/macro.
   * */
  push({ items, owner }) {
    return this.$publish('push', { items, owner });
  }
}
/**
 * Data stacks
 *
 * Stacks are a per-user named persistent queue of data
 *  An administrator creates a stack service
 *  End-users can push data on an arbitrary number of their own arbitrary named stacks
 * */
/**
 * Data stack user API
 *
 * Data is stored on a per user basis. However, notifications can be sent to a configurable set of listeners.
 * Stack names are arbitrary and do not need to be explicitly initialized.
 * @access public
 * */
export class Stack extends Service {
  /**
   * Get default deployment id associated to Stack service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'stack_0';
  }
  /**
   * Lists the listeners
   *
   * Returns the whole list of listeners for the given stack.
   * */
  getListeners({ stack, owner }) {
    return this.$publish('getListeners', { stack, owner });
  }
  /**
   * Lists content
   *
   * Returns a paginated list of contents for the given stack.
   * Content is sorted according to the statically configured order.
   * */
  list({ stack, owner, page }) {
    return this.$publish('list', { stack, owner, page });
  }
  /**
   * Empties a stack
   *
   * Removes all items from the given stack.
   * */
  purge({ stack, owner }) {
    return this.$publish('purge', { stack, owner });
  }
  /**
   * Pushes an item
   *
   * Pushes an item onto the given stack.
   * The stack does not need to be created.
   * */
  push({ stack, data, owner }) {
    return this.$publish('push', { stack, data, owner });
  }
  /**
   * Removes items
   *
   * Removes the item with the given guid from the given stack.
   * */
  remove({ guids, stack, owner }) {
    return this.$publish('remove', { guids, stack, owner });
  }
  /**
   * Sets the listeners
   *
   * Sets the listeners for the given stack.
   * */
  setListeners({ listeners, stack, owner }) {
    return this.$publish('setListeners', { listeners, stack, owner });
  }
  /**
   * Updates an item
   *
   * Updates an existing item of the given stack.
   * The item MUST exist prior to the call.
   * */
  update({ guid, stack, data, owner }) {
    return this.$publish('update', { guid, stack, data, owner });
  }
}
/**
 * Echo
 *
 * Echo
 * */
/**
 * Echo service
 *
 * Simple echo service, for development purposes.
 * @access public
 * */
export class Echo extends Service {
  /**
   * Get default deployment id associated to Echo service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'echo_0';
  }
  /**
   * Echoes an object
   *
   * Echoes an object: the server will echo that object on channel 'echo' for the current user.
   * */
  echo(parameter) {
    return this.$publish('echo', parameter);
  }
}
/**
 * Game engine
 *
 * Abstract Game Engine
 *  Concrete game engines are remote cometd clients or internal macros
 * */
/**
 * User API for games
 *
 * Users can list, start, join games, and play.
 * @access public
 * */
export class Game extends Service {
  /**
   * Get default deployment id associated to Game service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'game_0';
  }
  /**
   * Lists game types
   *
   * Returns the list of game types supported by the server and the currently registered game engines.
   * */
  available() {
    return this.$publish('available', {});
  }
  /**A user joins a game*/
  join({ role, gameId, userId, userName }) {
    return this.$publish('join', { role, gameId, userId, userName });
  }
  /**Organizes a game*/
  organize({ type, owner, options }) {
    return this.$publish('organize', { type, owner, options });
  }
  /**Gives some command to the game engine*/
  play({ gameId, userId, data }) {
    return this.$publish('play', { gameId, userId, data });
  }
  /**Starts a game*/
  start({ gameId }) {
    return this.$publish('start', { gameId });
  }
  /**A user cancels joining a game*/
  unjoin({ role, gameId, userId, userName }) {
    return this.$publish('unjoin', { role, gameId, userId, userName });
  }
}
/**
 * Game Engine API
 *
 * The Game Engine API is for game engine clients, not end-users.
 * @access public
 * */
export class GameEngine extends Service {
  /**
   * Get default deployment id associated to GameEngine service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'game_0';
  }
  /**
   * Notify the result for a join request
   *
   * A Game Engine notifies the STR of the result of a join request that it received on join_callback
   * */
  join_result({ msgId, payload, error, callerId }) {
    return this.$publish('join_result', { msgId, payload, error, callerId });
  }
  /**
   * Notify the result for an organization request
   *
   * A Game Engine notifies the STR of the result of an organization request that it received on organize_callback
   * */
  organize_result({ msgId, payload, error, callerId }) {
    return this.$publish('organize_result', {
      msgId,
      payload,
      error,
      callerId,
    });
  }
  /**
   * Registers a game engine
   *
   * A client registers itself to the STR as a Game Engine.
   * The STR may, from now on, dispatch game of the given game type to said client.
   * Unregistration is done automatically on logoff.
   * */
  register({ maxGames, gameInfo, location }) {
    return this.$publish('register', { maxGames, gameInfo, location });
  }
  /**
   * Notify the result for a start request
   *
   * A Game Engine notifies the STR of the result of a start request that it received on start_callback
   * */
  start_result({ gameId }) {
    return this.$publish('start_result', { gameId });
  }
  /**
   * Notify a game event
   *
   * A Game Engine notifies the STR of some arbitrary game event.
   * */
  state({ status, gameId, data }) {
    return this.$publish('state', { status, gameId, data });
  }
  /**
   * Notify the result for an unjoin request
   *
   * A Game Engine notifies the STR of the result of an unjoin request that it received on unjoin_callback
   * */
  unjoin_result({ msgId, payload, error, callerId }) {
    return this.$publish('unjoin_result', { msgId, payload, error, callerId });
  }
}
/**
 * Generic Data Access
 *
 * Generic Data Access Service : NoSQL storage
 * */
/**
 * GDA User API
 *
 * User API for Generic Data Access.
 * The data are stored on a per-user basis.
 * Users can put, get, list their data.
 * @access public
 * */
export class Gda extends Service {
  /**
   * Get default deployment id associated to Gda service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'gda_0';
  }
  /**
   * Asks for a data row
   *
   * Returns a full data row.
   * */
  get({ table, key, owner }) {
    return this.$publish('get', { table, key, owner });
  }
  /**
   * Asks for a data cell
   *
   * Returns a precise list of cells from a column in a data row.
   * */
  getCells({ table, key, key2, owner, column }) {
    return this.$publish('getCells', { table, key, key2, owner, column });
  }
  /**
   * Increments an integer value
   *
   * Increments a cell 64-bit signed integer value and returns the result in the data field.
   * The increment is atomic : if you concurrently increment 10 times a value by 1, the final result will be the initial value plus 10. The actual individual resulting values seen by the 10 concurrent callers may vary discontinuously, with duplicates : at least one of them will see the final (+10) result.
   * */
  inc({ table, data, key, key2, owner, column }) {
    return this.$publish('inc', { table, data, key, key2, owner, column });
  }
  /**
   * Asks for a list of rows
   *
   * Returns a paginated list of rows from the given table.
   * */
  list({ columns, table, owner, page }) {
    return this.$publish('list', { columns, table, owner, page });
  }
  /**
   * Puts some data into a cell
   *
   * Creates or replaces the contents of a particular cell.
   * */
  put({ table, data, key, key2, owner, column }) {
    return this.$publish('put', { table, data, key, key2, owner, column });
  }
  /**
   * Puts several rows
   *
   * Creates or replaces the (maybe partial) contents of a collection of rows.
   * This method only creates or replaces cells for non-null input values.
   * */
  puts({ rows, table, owner }) {
    return this.$publish('puts', { rows, table, owner });
  }
  /**
   * Asks for a range of rows
   *
   * Returns a paginated range of rows from the given table.
   * A range consists of consecutive rows from the start key (inclusive) to the stop key (exclusive).
   * You can specify partial keys for the start and stop fields.
   * */
  range({ columns, start, table, stop, owner, page }) {
    return this.$publish('range', { columns, start, table, stop, owner, page });
  }
  /**
   * Removes one cell inside a column of a row
   *
   * Removes only one cell of the given column of the given row from the given table.
   * */
  removeCell({ table, key, key2, owner, column }) {
    return this.$publish('removeCell', { table, key, key2, owner, column });
  }
  /**
   * Removes one full column of a row
   *
   * Removes all cells of the given column of the given row from the given table.
   * */
  removeColumn({ table, key, owner, column }) {
    return this.$publish('removeColumn', { table, key, owner, column });
  }
  /**
   * Removes a range of rows
   *
   * Removes the specified columns of the given range of rows from the given table.
   * */
  removeRange({ columns, start, table, stop, owner }) {
    return this.$publish('removeRange', { columns, start, table, stop, owner });
  }
  /**
   * Removes one full row
   *
   * Removes all columns of the given row from the given table.
   * */
  removeRow({ table, key, owner }) {
    return this.$publish('removeRow', { table, key, owner });
  }
}
/**
 * Groups Management
 *
 * Groups management for users, grants on resources, remote commands on devices
 *  This is where you can configure rights for any resource
 *
 * */
/**
 * User API for remote control
 *
 * @access public
 * */
export class Remoting extends Service {
  /**
   * Get default deployment id associated to Remoting service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'groups_0';
  }
  /**
   * Adds a listener
   *
   * A user requests notifications from a device owned by anyone who granted him the right authorizations.
   * Whenever the device calls 'notify', notifications will be sent to the caller of this verb.
   * */
  addListener({ resource, fromResource, cmd, from, data, owner }) {
    return this.$publish('addListener', {
      resource,
      fromResource,
      cmd,
      from,
      data,
      owner,
    });
  }
  /**Response to 'getCapabilities'*/
  capabilities({ askingResource, capabilities, answeringResource }) {
    return this.$publish('capabilities', {
      askingResource,
      capabilities,
      answeringResource,
    });
  }
  /**
   * Executes a command
   *
   * A user executes a command on a device owned by anyone who granted him the right authorizations.
   * The command is issued on channel 'command'
   * */
  execute({ resource, cmd, data, owner }) {
    return this.$publish('execute', { resource, cmd, data, owner });
  }
  /**
   * Requests capabilities
   *
   * A user requests all his devices for the whole list of their capabilities.
   * Devices are expected to answer on channel 'capabilities'
   * */
  getCapabilities() {
    return this.$publish('getCapabilities', {});
  }
  /**
   * Notifies of some event
   *
   * A device notifies the registered users/devices on this channel.
   * The server forwards the notification to said users.
   * */
  notify({ resource, fromResource, cmd, from, data, owner }) {
    return this.$publish('notify', {
      resource,
      fromResource,
      cmd,
      from,
      data,
      owner,
    });
  }
  /**
   * Pings devices
   *
   * A user requests all devices (of all owners) on which he has authorizations to respond on channel 'pong'
   * */
  ping({ action }) {
    return this.$publish('ping', { action });
  }
  /**Response to ping*/
  pong({ user, resource, available, uid, owner, action }) {
    return this.$publish('pong', {
      user,
      resource,
      available,
      uid,
      owner,
      action,
    });
  }
  /**
   * Removes a listener
   *
   * A user stops requesting notifications from a device owned by anyone who granted him the right authorizations
   * */
  removeListener({ resource, fromResource, cmd, from, data, owner }) {
    return this.$publish('removeListener', {
      resource,
      fromResource,
      cmd,
      from,
      data,
      owner,
    });
  }
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
   * Get default deployment id associated to GroupManagement service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'groups_0';
  }
  /**
   * Adds me to a group
   *
   * Adds me (the caller) to a group.
   * This verb exists so that group owners may grant the right to join their groups without granting the right to add other users to those groups.
   * The 'user' field is implicitly set to the current user's key.
   * */
  addMe({ group, owner }) {
    return this.$publish('addMe', { group, owner });
  }
  /**
   * Adds a user to a group
   *
   * Adds the given user to the given group.
   * Addition may fail if the given group does not already exist.
   * */
  addUser({ user, group, owner }) {
    return this.$publish('addUser', { user, group, owner });
  }
  /**Adds users to a group*/
  addUsers({ users, group, owner }) {
    return this.$publish('addUsers', { users, group, owner });
  }
  /**
   * Lists my owned groups, with details
   *
   * Returns the whole list of groups owned by the current user, with their members
   * */
  allGroups({ owner }) {
    return this.$publish('allGroups', { owner });
  }
  /**
   * Creates a group
   *
   * Creates a group owned by the current user.
   * Group creation may fail if the group already exists.
   * */
  createGroup({ group, groupName, owner }) {
    return this.$publish('createGroup', { group, groupName, owner });
  }
  /**
   * Removes a group
   *
   * Removes the given group owned by the current user or the given owner.
   * Also removes all grants to that group.
   * */
  delGroup({ group, owner }) {
    return this.$publish('delGroup', { group, owner });
  }
  /**Removes a user from a group*/
  delUser({ user, group, owner }) {
    return this.$publish('delUser', { user, group, owner });
  }
  /**Removes users from a group*/
  delUsers({ users, group, groupName, owner }) {
    return this.$publish('delUsers', { users, group, groupName, owner });
  }
  /**
   * Tests for a group's existence
   *
   * Returns whether a group exists or not.
   * */
  exists({ group, owner }) {
    return this.$publish('exists', { group, owner });
  }
  /**
   * Grants a right to a group
   *
   * The granting API does not do any check when storing permissions.
   * In particular when granting rights on a verb and resource of another API, the existence of said verb and resource is not checked.
   * */
  grant({ resource, group, owner, action }) {
    return this.$publish('grant', { resource, group, owner, action });
  }
  /**
   * Lists the group users
   *
   * Returns the whole list of users configured inside the given group.
   * */
  groupUsers({ group, owner }) {
    return this.$publish('groupUsers', { group, owner });
  }
  /**
   * Lists my owned groups
   *
   * Returns the whole list of groups owned by the current user
   * */
  groups({ owner }) {
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
  listPresences({ group, owner }) {
    return this.$publish('listPresences', { group, owner });
  }
  /**
   * Tests membership
   *
   * Tests whether I (the caller) am a member of the given group.
   * This verb exists so that users can determine if they are part of a group without being granted particular rights.
   * The 'user' field is implicitly set to the current user's key.
   * */
  memberOf({ hardFail, group, owner }) {
    return this.$publish('memberOf', { hardFail, group, owner });
  }
  /**
   * Grants rights to a group
   *
   * Grant several rights at once.
   * */
  mgrant({ resource, actions, group, owner }) {
    return this.$publish('mgrant', { resource, actions, group, owner });
  }
  /**Revokes rights for a group*/
  mrevoke({ resource, actions, group, owner }) {
    return this.$publish('mrevoke', { resource, actions, group, owner });
  }
  /**
   * Lists the groups I am part of
   *
   * Returns the whole list of groups the current user is part of.
   * Groups may be owned by anyone, including the current user.
   * */
  myGroups({ owner }) {
    return this.$publish('myGroups', { owner });
  }
  /**Revokes a right for a group*/
  revoke({ resource, group, owner, action }) {
    return this.$publish('revoke', { resource, group, owner, action });
  }
}
/**
 * HTTP client
 *
 * Web-service client
 *  An admin records URL templates that can be called by users
 *  Calls are not configurable by end-users
 *  However an admin may leverage the macro service to achieve URL, headers and body configurability
 * */
/**
 * User API for http requests
 *
 * @access public
 * */
export class Httpclient extends Service {
  /**
   * Get default deployment id associated to Httpclient service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'httpclient_0';
  }
  /**
   * Makes a predefined request
   *
   * Lookups a predefined request by name, and executes it.
   * */
  call({ name, requestId }) {
    return this.$publish('call', { name, requestId });
  }
}
/**
 * Macros
 *
 * Macro-command service
 *  An admin defines macro-commands that can sequentially call any number of other api verbs, loop on collections of data, make decisions, etc
 *
 *
 *  End-users play them, with contextual parameters
 * */
/**
 * User API for macro debugging
 *
 * Debugger API for macro.
 * These API verbs are not intended for use by most developers.
 * @access public
 * */
export class MacroDebug extends Service {
  /**
   * Get default deployment id associated to MacroDebug service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'macro_0';
  }
  /**Enables or disables a breakpoint*/
  breakpoint({ breakpoint, token, enabled }) {
    return this.$publish('breakpoint', { breakpoint, token, enabled });
  }
  /**Requests some information*/
  info({ token, path, exp, requestId, frame }) {
    return this.$publish('info', { token, path, exp, requestId, frame });
  }
  /**
   * Debugs a previously recorded macro
   *
   * The given breakpoints will be honored, causing a suspension of the execution, resumable via 'resume'.
   * Only one debug session can be active at any given time.
   * */
  livedebug({
    parameters,
    token,
    breakpoints,
    hardFail,
    name,
    requestId,
    debug,
  }) {
    return this.$publish('livedebug', {
      parameters,
      token,
      breakpoints,
      hardFail,
      name,
      requestId,
      debug,
    });
  }
  /**Resumes a paused macro*/
  resume({ token, type }) {
    return this.$publish('resume', { token, type });
  }
  /**Sets a variable value*/
  variable({ token, name, frame, data }) {
    return this.$publish('variable', { token, name, frame, data });
  }
}
/**
 * User API for macro execution
 *
 * Simple errors are reported as usual.
 * However, the macro execution verbs treat most errors in a particular way : instead of reporting errors on the usual 'error' channel, errors are put in the returned 'MacroCompletion' result.
 * This behavior can be tuned on a per-call basis with the hardFail parameter.
 * Note that some particular errors will always behave as if hardFail were true, because they are related to programming errors, or prevent processing from ending gracefully : STACK_OVERFLOW, NO_SUCH_FUNCTION, RAM_EXCEEDED, CYCLES_EXCEEDED, TIME_EXCEEDED, QUOTA_EXCEEDED, RATE_EXCEEDED, BAD_COMPARATOR_VALUE
 * @access public
 * */
export class Macro extends Service {
  /**
   * Get default deployment id associated to Macro service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'macro_0';
  }
  /**
   * Plays a previously recorded macro
   *
   * DO NOT use this verb from inside an enclosing macro when you need the result in order to proceed with the enclosing macro.
   * You can override the default notification channel when defining the macro.
   * */
  call({ parameters, hardFail, name, requestId, debug }) {
    return this.$publish('call', {
      parameters,
      hardFail,
      name,
      requestId,
      debug,
    });
  }
}
/**
 * Mail sender
 *
 * Sends email through SMTP
 * */
/**
 * Mail service user API
 *
 * This service is statically configured with an outgoing SMTP server.
 * Users call the API here to actually send emails.
 * @access public
 * */
export class Sendmail extends Service {
  /**
   * Get default deployment id associated to Sendmail service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'sendmail_0';
  }
}
/**
 * Messaging service
 *
 * Messaging service
 * */
/**
 * Messaging service
 *
 * Simple and flexible user-to-user or user-to-group messaging service.
 * @access public
 * */
export class Messaging extends Service {
  /**
   * Get default deployment id associated to Messaging service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'messaging_0';
  }
  /**
   * Sends a message to a target
   *
   * Sends the given message to the specified target on the given (optional) channel.
   * The administratively given default channel name is used when none is provided in the message itself.
   * */
  send({ target, channel, data }) {
    return this.$publish('send', { target, channel, data });
  }
}
/**
 * Producer consumer
 *
 * Producer consumer service
 *  Users can submit tasks and other users consume them
 * */
/**
 * Producer / consumer real-time API
 *
 * Task producers submits their tasks.
 * The server dispatches the tasks.
 * Consumers process them and report completion back to the server.
 * Tasks are global to the service (i.e. NOT per user).
 * @access public
 * */
export class Queue extends Service {
  /**
   * Get default deployment id associated to Queue service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'queue_0';
  }
  /**
   * Submits a task
   *
   * Producer API.
   * A task producer submits the given task to the server.
   * The server will find a tasker with processing capacity and dispatch the task.
   * The task result will be returned to the caller.
   * When called from inside a macro, the comsumer generated result is available for further use.
   * */
  call({ description, originBusinessId, originDeploymentId, data, owner }) {
    return this.$publish('call', {
      description,
      originBusinessId,
      originDeploymentId,
      data,
      owner,
    });
  }
  /**
   * Notifies completion of a task
   *
   * Consumer API.
   * The tasker notifies completion of the given task to the server.
   * The tasker can optionally include a result or an error code.
   * */
  done({ target, result, taskId, requestId, success }) {
    return this.$publish('done', {
      target,
      result,
      taskId,
      requestId,
      success,
    });
  }
  /**
   * Registers a consumer
   *
   * Consumer API.
   * Registers the current user resource as an available task consumer.
   * Tasks will be then dispatched to that consumer.
   * */
  register({ capacity }) {
    return this.$publish('register', { capacity });
  }
  /**
   * Submits a task
   *
   * Producer API.
   * A task producer submits the given task to the server.
   * The server will find a tasker with processing capacity and dispatch the task.
   * The task result will be ignored : the producer will not receive any notification of any kind, even in case of errors (including capacity exceeded errors).
   * This verb will return immediately : you can use this API to asynchronously submit a task.
   * */
  submit({ description, originBusinessId, originDeploymentId, data, owner }) {
    return this.$publish('submit', {
      description,
      originBusinessId,
      originDeploymentId,
      data,
      owner,
    });
  }
  /**
   * Unregisters a consumer
   *
   * Consumer API.
   * Unregisters the current user resource as an available task consumer.
   * All non finished tasks are returned to the server.
   * */
  unregister() {
    return this.$publish('unregister', {});
  }
}
/**
 * Push Notifications
 *
 * Native Push Notifications for Android, iOS
 *
 *
 *
 * */
/**
 * Notification User API
 *
 * User API for notifications.
 * For notifications to work properly, it is imperative that the resource name of a device remain constant over time.
 * @access public
 * */
export class Notif extends Service {
  /**
   * Get default deployment id associated to Notif service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'notif_0';
  }
}
/**
 * RDBMS
 *
 * Relational Database : SQL storage
 * */
/**
 * RDBMS User API
 *
 * User API for SQL queries.
 * Contrary to GDA or Stacks, the data are not stored on a per-user basis.
 * Users can store, get, list their data.
 * @access public
 * */
export class Rdbms extends Service {
  /**
   * Get default deployment id associated to Rdbms service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'rdbms_0';
  }
}
/**
 * SMS via OVH
 *
 * SMS sender, to send text messages to mobile phones
 * This SMS sending service uses the OVH API
 *
 * */
/**
 * SMS service
 *
 * User API for SMS.
 * @access public
 * */
export class Sms_ovh extends Service {
  /**
   * Get default deployment id associated to Sms_ovh service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'sms_ovh_0';
  }
}
/**
 * Scheduler
 *
 * Scheduler service
 *  End-users can schedule one-time or repetitive tasks using a classical cron syntax (with the year field) or a timestamp (milliseconds from the epoch)
 * */
/**
 * User API for the Scheduler
 *
 * User endpoints for scheduling : users can schedule, list and delete tasks.
 * Tasks are stored on a per-user basis: a task will run with the priviledges of the user who stored it.
 * Tasks are run on the server and thus can call api verbs marked as server-only.
 * @access public
 * */
export class Cron extends Service {
  /**
   * Get default deployment id associated to Cron service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'cron_0';
  }
  /**
   * List the configured tasks
   *
   * Returns a paginated list of the asking user's tasks.
   * */
  list({ start, stop, owner, page }) {
    return this.$publish('list', { start, stop, owner, page });
  }
}
/**
 * Search engine
 *
 * ElasticSearch engine, to index and search data
 *  An admin creates indices
 *  Users index and search documents
 *
 * */
/**
 * ElasticSearch Service
 *
 * This API is a very thin wrapper around ElasticSearch's API.
 * @access public
 * */
export class Search extends Service {
  /**
   * Get default deployment id associated to Search service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'search_0';
  }
  /**
   * Deletes data
   *
   * Deletes a document from the elasticsearch engine by id.
   * */
  delete({ type, id, index }) {
    return this.$publish('delete', { type, id, index });
  }
  /**
   * Gets data
   *
   * Retrieves a document from the elasticsearch engine by id.
   * */
  get({ type, id, index }) {
    return this.$publish('get', { type, id, index });
  }
  /**
   * Indexes data
   *
   * Inserts or updates a document into the elasticsearch engine.
   * */
  index({ type, id, index, data }) {
    return this.$publish('index', { type, id, index, data });
  }
  /**Searches for data*/
  search({ indices, query, sort, page, types }) {
    return this.$publish('search', { indices, query, sort, page, types });
  }
}
/**
 * Template engine
 *
 * Template engine to produce documents from parameterized templates
 * <br>An admin creates templates
 * <br> Users produce documents
 * <br>The implementation uses the <a href='http://freemarker
 * org/'>freemarker</a> engine
 *
 * */
/**
 * User API for templates
 *
 * Users use this API to evaluate pre-configured templates.
 * @access public
 * */
export class Template extends Service {
  /**
   * Get default deployment id associated to Template service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'template_0';
  }
  /**
   * Evaluates a template
   *
   * Evaluates the given template and returns the result as a string.
   * Templates are parsed the first time they are evaluated. Evaluation may fail early due to a parsing error.
   * */
  evaluate({ languageTag, name, requestId, data }) {
    return this.$publish('evaluate', { languageTag, name, requestId, data });
  }
}
/**
 * Triggers
 *
 * Register callbacks for events and trigger them when needed
 *
 * */
/**
 * Trigger service
 *
 * Register listeners and trigger events.
 * @access public
 * */
export class Trigger extends Service {
  /**
   * Get default deployment id associated to Trigger service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'trigger_0';
  }
}
/**
 * Upload: S3
 *
 * Upload service with S3 storage
 * */
/**
 * User API for file management
 *
 * User API for virtual file management and http file upload
 * This API contains all the verbs needed to browse, upload and remove files.
 * Files are stored on a per-user basis: each user has his or her own whole virtual filesystem.
 * Uploading a file is a 3-step process : request an upload URL, upload via HTTP, notify this service of completion.
 * @access public
 * */
export class Zpfs_s3 extends Service {
  /**
   * Get default deployment id associated to Zpfs_s3 service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'zpfs_s3_0';
  }
  /**
   * Copies a file
   *
   * Copies a file or folder (recursively) to a new location.
   * May fail if the target location is not empty.
   * */
  cp({ oldPath, path, owner }) {
    return this.$publish('cp', { oldPath, path, owner });
  }
  /**
   * Returns disk usage
   *
   * Returns an recursively aggregated number of used bytes, starting at the given path.
   * */
  du({ path, owner }) {
    return this.$publish('du', { path, owner });
  }
  /**
   * Links a file
   *
   * Links a file or folder to another location.
   * May fail if the target location is not empty.
   * */
  link({ oldPath, path, owner }) {
    return this.$publish('link', { oldPath, path, owner });
  }
  /**
   * Lists a folder content
   *
   * Returns a paginated list of the folder's content.
   * */
  ls({ folder, owner, page }) {
    return this.$publish('ls', { folder, owner, page });
  }
  /**
   * Creates a folder
   *
   * Creates a new folder.
   * May fail if the target location is not empty.
   * */
  mkdir({ parents, folder, owner }) {
    return this.$publish('mkdir', { parents, folder, owner });
  }
  /**
   * Moves a file
   *
   * Moves a file or folder (recursively) to a new location.
   * May fail if the target location is not empty.
   * */
  mv({ oldPath, path, owner }) {
    return this.$publish('mv', { oldPath, path, owner });
  }
  /**
   * Notifies of upload completion
   *
   * The client application calls this verb to notify that it's done uploading to the cloud.
   * Calling that verb MAY trigger additional events such as thumbnail/metadata creation.
   * */
  newFile({ tags, guid, metadata, owner }) {
    return this.$publish('newFile', { tags, guid, metadata, owner });
  }
  /**
   * Requests an upload URL
   *
   * Requests an HTTP upload URL.
   * The URL contains temporary credentials (typically valid for a few minutes) and is meant for immediate use.
   * */
  newUploadUrl({ contentType, path, owner }) {
    return this.$publish('newUploadUrl', { contentType, path, owner });
  }
  /**
   * Removes a file
   *
   * Removes a file or folder (recursively).
   * */
  rm({ path, owner }) {
    return this.$publish('rm', { path, owner });
  }
  /**
   * Creates a snapshot in a new folder
   *
   * Creates a new folder and then copies the given files inside
   * */
  snapshot({ parents, folder, items, flatten, owner }) {
    return this.$publish('snapshot', {
      parents,
      folder,
      items,
      flatten,
      owner,
    });
  }
  /**
   * Returns information about a file
   *
   * Returns information about a single file.
   * The entry field will be null if the path does not exist
   * */
  stat({ path, owner }) {
    return this.$publish('stat', { path, owner });
  }
  /**Updates a file's metadata*/
  updateMeta({ path, metadataFiles, metadata, owner }) {
    return this.$publish('updateMeta', {
      path,
      metadataFiles,
      metadata,
      owner,
    });
  }
}
/**
 * Upload: local
 *
 * Upload service with local HDFS storage
 * */
/**
 * User API for local file management
 *
 * User API for file content manipulation
 * @access public
 * */
export class Zpfs_hdfs extends Service {
  /**
   * Get default deployment id associated to Zpfs_hdfs service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'zpfs_hdfs_0';
  }
  /**
   * Copies a file
   *
   * Copies a file or folder (recursively) to a new location.
   * May fail if the target location is not empty.
   * */
  cp({ oldPath, path, owner }) {
    return this.$publish('cp', { oldPath, path, owner });
  }
  /**
   * Returns disk usage
   *
   * Returns an recursively aggregated number of used bytes, starting at the given path.
   * */
  du({ path, owner }) {
    return this.$publish('du', { path, owner });
  }
  /**
   * Links a file
   *
   * Links a file or folder to another location.
   * May fail if the target location is not empty.
   * */
  link({ oldPath, path, owner }) {
    return this.$publish('link', { oldPath, path, owner });
  }
  /**
   * Lists a folder content
   *
   * Returns a paginated list of the folder's content.
   * */
  ls({ folder, owner, page }) {
    return this.$publish('ls', { folder, owner, page });
  }
  /**
   * Creates a folder
   *
   * Creates a new folder.
   * May fail if the target location is not empty.
   * */
  mkdir({ parents, folder, owner }) {
    return this.$publish('mkdir', { parents, folder, owner });
  }
  /**
   * Moves a file
   *
   * Moves a file or folder (recursively) to a new location.
   * May fail if the target location is not empty.
   * */
  mv({ oldPath, path, owner }) {
    return this.$publish('mv', { oldPath, path, owner });
  }
  /**
   * Notifies of upload completion
   *
   * The client application calls this verb to notify that it's done uploading to the cloud.
   * Calling that verb MAY trigger additional events such as thumbnail/metadata creation.
   * */
  newFile({ tags, guid, metadata, owner }) {
    return this.$publish('newFile', { tags, guid, metadata, owner });
  }
  /**
   * Requests an upload URL
   *
   * Requests an HTTP upload URL.
   * The URL contains temporary credentials (typically valid for a few minutes) and is meant for immediate use.
   * */
  newUploadUrl({ contentType, path, owner }) {
    return this.$publish('newUploadUrl', { contentType, path, owner });
  }
  /**
   * Removes a file
   *
   * Removes a file or folder (recursively).
   * */
  rm({ path, owner }) {
    return this.$publish('rm', { path, owner });
  }
  /**
   * Creates a snapshot in a new folder
   *
   * Creates a new folder and then copies the given files inside
   * */
  snapshot({ parents, folder, items, flatten, owner }) {
    return this.$publish('snapshot', {
      parents,
      folder,
      items,
      flatten,
      owner,
    });
  }
  /**
   * Returns information about a file
   *
   * Returns information about a single file.
   * The entry field will be null if the path does not exist
   * */
  stat({ path, owner }) {
    return this.$publish('stat', { path, owner });
  }
  /**Updates a file's metadata*/
  updateMeta({ path, metadataFiles, metadata, owner }) {
    return this.$publish('updateMeta', {
      path,
      metadataFiles,
      metadata,
      owner,
    });
  }
}
/**
 * Upload: pseudo-S3
 *
 * Upload service with pseudo-S3compatible storage
 * */
/**
 * User API for file management
 *
 * User API for virtual file management and http file upload
 * This API contains all the verbs needed to browse, upload and remove files.
 * Files are stored on a per-user basis: each user has his or her own whole virtual filesystem.
 * Uploading a file is a 3-step process : request an upload URL, upload via HTTP, notify this service of completion.
 * @access public
 * */
export class Zpfs_s3compat extends Service {
  /**
   * Get default deployment id associated to Zpfs_s3compat service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'zpfs_s3compat_0';
  }
  /**
   * Copies a file
   *
   * Copies a file or folder (recursively) to a new location.
   * May fail if the target location is not empty.
   * */
  cp({ oldPath, path, owner }) {
    return this.$publish('cp', { oldPath, path, owner });
  }
  /**
   * Returns disk usage
   *
   * Returns an recursively aggregated number of used bytes, starting at the given path.
   * */
  du({ path, owner }) {
    return this.$publish('du', { path, owner });
  }
  /**
   * Links a file
   *
   * Links a file or folder to another location.
   * May fail if the target location is not empty.
   * */
  link({ oldPath, path, owner }) {
    return this.$publish('link', { oldPath, path, owner });
  }
  /**
   * Lists a folder content
   *
   * Returns a paginated list of the folder's content.
   * */
  ls({ folder, owner, page }) {
    return this.$publish('ls', { folder, owner, page });
  }
  /**
   * Creates a folder
   *
   * Creates a new folder.
   * May fail if the target location is not empty.
   * */
  mkdir({ parents, folder, owner }) {
    return this.$publish('mkdir', { parents, folder, owner });
  }
  /**
   * Moves a file
   *
   * Moves a file or folder (recursively) to a new location.
   * May fail if the target location is not empty.
   * */
  mv({ oldPath, path, owner }) {
    return this.$publish('mv', { oldPath, path, owner });
  }
  /**
   * Notifies of upload completion
   *
   * The client application calls this verb to notify that it's done uploading to the cloud.
   * Calling that verb MAY trigger additional events such as thumbnail/metadata creation.
   * */
  newFile({ tags, guid, metadata, owner }) {
    return this.$publish('newFile', { tags, guid, metadata, owner });
  }
  /**
   * Requests an upload URL
   *
   * Requests an HTTP upload URL.
   * The URL contains temporary credentials (typically valid for a few minutes) and is meant for immediate use.
   * */
  newUploadUrl({ contentType, path, owner }) {
    return this.$publish('newUploadUrl', { contentType, path, owner });
  }
  /**
   * Removes a file
   *
   * Removes a file or folder (recursively).
   * */
  rm({ path, owner }) {
    return this.$publish('rm', { path, owner });
  }
  /**
   * Creates a snapshot in a new folder
   *
   * Creates a new folder and then copies the given files inside
   * */
  snapshot({ parents, folder, items, flatten, owner }) {
    return this.$publish('snapshot', {
      parents,
      folder,
      items,
      flatten,
      owner,
    });
  }
  /**
   * Returns information about a file
   *
   * Returns information about a single file.
   * The entry field will be null if the path does not exist
   * */
  stat({ path, owner }) {
    return this.$publish('stat', { path, owner });
  }
  /**Updates a file's metadata*/
  updateMeta({ path, metadataFiles, metadata, owner }) {
    return this.$publish('updateMeta', {
      path,
      metadataFiles,
      metadata,
      owner,
    });
  }
}
/**
 * User directory service
 *
 * User directory service
 * */
/**
 * User API for user information
 *
 * @access public
 * */
export class Userdir extends Service {
  /**
   * Get default deployment id associated to Userdir service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'userdir_0';
  }
  /**Searches for users matching the request*/
  search({ requestId, query, page }) {
    return this.$publish('search', { requestId, query, page });
  }
  /**Requests public data for the specified users*/
  userInfo({ userKeys }) {
    return this.$publish('userInfo', { userKeys });
  }
}
