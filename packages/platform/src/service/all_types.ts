/** Maps strings to any */
export type StringAnyMap = {
  [property: string]: any;
};
/** Maps strings to strings */
export type StringStringMap = {
  [property: string]: string;
};
/** Maps strings to StringAnyMap */
export type StringObjectMap = {
  [property: string]: StringAnyMap;
};
/** Base64 representation of a byte array */
export type Base64EncodedBytes = string;

export interface PageContent<T> {
  /** Content */
  content: T[];
  /** Pagination information */
  page: Pagination;
}
export type ListOrSingle = string | string[];

export enum PageDirection {
  /**EMPTY DESC*/
  DESC = 'DESC',
  /**EMPTY DESC*/
  ASC = 'ASC',
}

export interface Pagination {
  /**Page size (minimum 1)*/
  pageSize: number;
  /**Page number (zero-based)*/
  pageNumber: number;
  /**Sort direction. Default is ASC when not specified.*/
  direction: PageDirection;
}

export interface SoapFault {
  /**EMPTY DESC*/
  detail: any[];
  /**EMPTY DESC*/
  faultcode: string;
  /**EMPTY DESC*/
  faultstring: string;
}

export interface GamePlay {
  /**Server attributed game identifier*/
  gameId: string;
  /**User unique key*/
  userId: string;
  /**Game-specific data*/
  data: StringAnyMap;
}

export interface GameType {
  /**Game description*/
  description: string;
  /**Game type identifier*/
  name: string;
}

export interface HttpClientHeader {
  /**Header value*/
  value: string;
  /**Header name*/
  name?: string;
}

export interface UserControlStatus {
  /**User key of the controlling user*/
  controller: string;
  /**Public token of the weak you want to control*/
  publicToken: string;
  /**Whether the controlled user/device fully impersonates its controller*/
  fullRights: boolean;
}

export interface Thumbnail {
  /**The unique identifier of the thumbnail*/
  guid: string;
  /**The name of the thumbnail*/
  name: string;
  /**The size of the thumbnail*/
  size: string;
}

export interface MacroCompletionStats {
  /**Elapsed server time for the execution of the macro*/
  elapsedMillis: number;
  /**Total number of RAM bytes*/
  ram: number;
  /**Total number of called verbs*/
  nbCalls: number;
  /**Total number of VM cycles*/
  cycles: number;
}

export interface GdaCellRequest {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Table name*/
  table?: string;
  /**Row key*/
  key?: string;
  /**cell key inside the column*/
  key2?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**column name inside the row*/
  column?: string;
}

export interface TriggerId {
  /**Event name*/
  event?: string;
  /**Listener name*/
  name?: string;
}

export interface ZpfsRequest {
  /**File path*/
  path: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface MacroStep {
  /**Informative text, for the macro creator. You SHOULD always fill this field, as reported errors will include this description.*/
  description: string;
  /**Line number in source file*/
  line: number;
}

export interface CronTaskRequest {
  /**Cron identifier. mandatory for creation or update.*/
  cronName?: string;
  /**Cron-like expression (with fixed minutes and hours) or unix timestamp (as milliseconds from the epoch). Times are UTC.*/
  schedule?: any;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Parameter that will be passed to the target verb when called. The format is the format accepted by the target.*/
  parameter: StringAnyMap;
  /**Max number of executions.*/
  stop: number;
  /**DeploymentId of the target service.*/
  deploymentId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**Verb to be called within the target service.*/
  verb?: string;
  /**Specifies whether this call should generate all expected direct user notifications (primary outputs). Does not affect side-effects (other outputs). Defaults to false*/
  loud: boolean;
}

export interface RdbmsResultSet {}

export enum Base64Format {
  /**EMPTY DESC*/
  RFC2045 = 'RFC2045',
  /**EMPTY DESC*/
  RFC4648 = 'RFC4648',
  /**EMPTY DESC*/
  RFC4648_URLSAFE = 'RFC4648_URLSAFE',
}

export interface WorkflowStateDefinition {
  /**ID of the state*/
  stateId?: string;
  /**State name*/
  stateName: string;
}

export interface GameJoin {
  /**Optional role for the player. Meaning is game specific*/
  role: string;
  /**Server attributed game identifier*/
  gameId: string;
  /**User unique key*/
  userId: string;
  /**Player name inside the game*/
  userName: string;
}

export interface TaskCompletion {
  /**Target for the response (the syntax is the same as in messaging.send). Overrides 'broadcast' when set.*/
  target: any;
  /**Optional result of the processing. When 'success' is false, can contain an error object (with String fields 'code' and 'message').*/
  result: any;
  /**Server-assigned task identifier.*/
  taskId: string;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId: string;
  /**A task consumer can specify whether computation was a success or not.*/
  success: boolean;
}

export enum NotificationPlatform {
  /**EMPTY DESC*/
  APNS = 'APNS',
  /**EMPTY DESC*/
  APNS_VOIP_SANDBOX = 'APNS_VOIP_SANDBOX',
  /**EMPTY DESC*/
  APNS_SANDBOX = 'APNS_SANDBOX',
  /**EMPTY DESC*/
  GCM = 'GCM',
}

export interface StackListeners {
  /**List of userKeys (as in the value of __userKey) or fully qualified group names (the syntax is groupServiceDeploymentId:userKey:group) that will be notified of modifying stack operations*/
  listeners: string[];
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Stack name.*/
  stack?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface ZpfsToken {
  /**Access token for the folder*/
  token: string;
  /**File path*/
  path: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface CreatedFile {
  /**Old name (if applicable)*/
  oldPath: string;
  /**File path*/
  path: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface MacroServiceStatus {
  /**Number of macros currently running*/
  currentNb: number;
  /**Whether this macro service is currently in debug mode*/
  debug: boolean;
  /**Total number of macros currently running, including nested calls*/
  totalNb: number;
}

export interface MacroDebugEventResume {}

export interface GroupUsers {
  /**User keys of the group members*/
  users: string[];
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Group id. Must be alphanumerical. You MAY use the wildcard '*' when granting rights.*/
  group?: string;
  /**Group name, as displayed to the user*/
  groupName: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface OwnedGroupsWithDetails {
  /**Detailed groups owned by the user.*/
  groups: PageContent<GroupUsers>;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export enum Idempotence {
  /**EMPTY DESC*/
  IGNORE_DIFFERENT = 'IGNORE_DIFFERENT',
  /**EMPTY DESC*/
  FAIL_IF_EXISTING = 'FAIL_IF_EXISTING',
  /**EMPTY DESC*/
  IGNORE_IDENTICAL = 'IGNORE_IDENTICAL',
}

export interface BasicUserCreation {
  /**You can pass any number of arbitrary properties in the enclosing object (there is no field actually named additionalProperties).*/
  additionalProperties: StringAnyMap;
  /**Specify the behavior when the user already exists. The default value is IGNORE_IDENTICAL*/
  idempotence: Idempotence;
}

export interface FileStatRequest {
  /**File path*/
  path: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface GroupExistence {
  /**Existence of the group*/
  exists: boolean;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Group id. Must be alphanumerical. You MAY use the wildcard '*' when granting rights.*/
  group?: string;
  /**Group name, as displayed to the user*/
  groupName: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface ResetInfo {
  /**Server-provided temporary token to reset a password*/
  token: string;
  /**account key in the realm. (configured 'unique key' used for authentication)*/
  key: string;
}

export interface AggregationPush {
  /**Numerical value : long for totals, floating point (double precision IEEE 754) for means*/
  value?: number;
  /**Item name. Any item name, unique for the user. An item more or less matches an actual device or sensor, but it can also be for example a virtual sensor name if you are averaging temperatures from several physical sensors.*/
  name?: string;
  /**Item category. Must match a defined category.*/
  category?: string;
}

export interface MacroScriptParamConstraint {
  /**Constraint configuration*/
  config: StringAnyMap;
  /**Constraint name*/
  name: string;
}

export interface FileUploadComplete {
  /**File tags*/
  tags: string[];
  /**File GUID*/
  guid?: string;
  /**File metadata*/
  metadata: StringAnyMap;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface MacroDebugEvent {}

export interface TimerRequest {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Parameter that will be passed to the target verb when called. The format is the format accepted by the target.*/
  parameter: StringAnyMap;
  /**DeploymentId of the target service.*/
  deploymentId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**Verb to be called within the target service.*/
  verb?: string;
  /**Delay in seconds before calling the given API. Must be a integer between 1 and 120.*/
  delay: number;
  /**Specifies whether this call should generate all expected direct user notifications (primary outputs). Does not affect side-effects (other outputs). Defaults to false*/
  loud: boolean;
}

export interface OwnerResource {
  /**Optional resource name, used to distinguish between two sessions of the same user on different devices. A given device SHOULD provide a resource name, and SHOULD always use the same resource name (it needs to be persisted by the client code)*/
  resource: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface TaskRequest {
  /**Request submitter*/
  originator: OwnerResource;
  /**Task description*/
  description: string;
  /**BusinessId of the service which the task is from*/
  originBusinessId: string;
  /**DeploymentId of the service which the task is from*/
  originDeploymentId: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Task parameters. Specific for each consumer/producer contract*/
  data: any;
  /**When impersonating someone, use this field to differentiate from originator.owner*/
  owner: string;
}

export interface Email {
  /**Email recipients*/
  to: string[];
  /**Email html body. you can use text and/or html*/
  html: string;
  /**Email recipients*/
  cc: string[];
  /**Email recipients*/
  bcc: string[];
  /**Email subject*/
  subject?: string;
  /**Email plain text body*/
  text: string;
}

export interface TemplateRemoval {
  /**IETF BCP 47 language tag*/
  languageTag: string;
  /**template name*/
  name?: string;
}

export interface WorkflowTemplateList {
  /**Pagination information*/
  page: Pagination;
}

export interface ZpfsFileHandler {
  /**Opaque file handler, for use by 'read' calls.*/
  handle: any;
}

export enum AggregationItemType {
  /**EMPTY DESC*/
  MEAN = 'MEAN',
  /**EMPTY DESC*/
  TOTAL = 'TOTAL',
}

export interface HttpClientSOAPResponse {
  /**received content*/
  content: any;
  /**EMPTY DESC*/
  fault: SoapFault;
  /**received headers*/
  headers: HttpClientHeader[];
  /**response http status code*/
  httpStatus: number;
  /**optional client generated call ID to identify responses*/
  requestId: string;
}

export interface BasicAuthenticatedUser {
  /**You can pass any number of arbitrary properties in the enclosing object (there is no field actually named additionalProperties). */
  additionalProperties: StringAnyMap;
}

export interface SearchResultsItem {
  /**Type name*/
  type?: string;
  /**Document id*/
  id?: string;
  /**Index name*/
  index?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Document data*/
  data?: StringAnyMap;
  /**Item score*/
  score: number;
}

export interface SearchResults {
  /**List of found items*/
  items: PageContent<SearchResultsItem>;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId: string;
  /**Total number of documents matching the query*/
  totalHits: number;
}

export interface AllCredentials {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**List of account information for the asking user. empty if the user does not have credentials in the service. One item in this list is a map of account fields.*/
  credentials: StringAnyMap[];
}

export enum GameStatus {
  /**EMPTY DESC*/
  RUNNING = 'RUNNING',
  /**EMPTY DESC*/
  FINISHED = 'FINISHED',
  /**EMPTY DESC*/
  CREATED = 'CREATED',
  /**EMPTY DESC*/
  STARTING = 'STARTING',
}

export interface MacroLog {
  /**Informative text, for the macro creator. You SHOULD always fill this field, as reported errors will include this description.*/
  description: string;
  /**Data to be logged. The server will fail to produce an accurate result if the actual evaluated data is too big.*/
  data: any;
  /**Line number in source file*/
  line: number;
}

export interface MacroCall {
  /**Informative text, for the macro creator. You SHOULD always fill this field, as reported errors will include this description.*/
  description: string;
  /**Key of the impersonated user*/
  suKey: string;
  /**Specifies whether parameter expansion should be avoided. The server will of course set this to true automatically if no refs are present. Defaults to false*/
  noExpand: boolean;
  /**Name of the result, for future reference*/
  resultName: string;
  /**Parameter that will be passed to the verb. The format is the format expected by the target verb, with the following exception : any field can be replaced by a placeholder. A placeholder is an object with a '__ref' field. The value of the ref field follows java EL syntax with some pre-defined objects and functions (see the documentation on macros)*/
  parameter: StringAnyMap;
  /**DeploymentId of the service to be called*/
  deploymentId?: string;
  /**Line number in source file*/
  line: number;
  /**Verb to be called inside the specified service*/
  verb?: string;
  /**Specifies whether this call should generate all expected direct user notifications (primary outputs). Does not affect side-effects (other outputs). Defaults to false*/
  loud: boolean;
}

export interface MacroServiceDebugConfig {
  /**Whether this macro service is currently in debug mode*/
  debug: boolean;
}

export interface FileMetaUpdate {
  /**File path*/
  path: string;
  /**Metadata to be processed and updated. Values are translated from GUIDs to URLs by the underlying storage provider*/
  metadataFiles: StringStringMap;
  /**Metadata to be updated*/
  metadata: StringAnyMap;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface GroupInfo {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Group id. Must be alphanumerical. You MAY use the wildcard '*' when granting rights.*/
  group?: string;
  /**Group name, as displayed to the user*/
  groupName: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface ProvisioningRequest {
  /**Number of accounts to create*/
  n: number;
}

export interface GameOrganization {
  /**Game type*/
  type?: GameType;
  /**Game identifier*/
  gameId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**Game creation options*/
  options: StringAnyMap;
}

export interface GdaRowRequest {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Table name*/
  table?: string;
  /**Row key*/
  key?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface LocalizedTemplateCreation {
  /**IETF BCP 47 language tag*/
  languageTag?: string;
  /**template name*/
  name?: string;
  /**template contents, as a character string*/
  template?: string;
}

export interface SearchRequestSortField {
  /**Field name*/
  name: string;
  /**Field sort information. Follows elasticsearch syntax.*/
  sort: StringAnyMap;
}

export interface UserLoginchange {
  /**New account key within this realm. Must not be already in use.*/
  newKey?: string;
  /**Existing account key within this realm (login). Will be free for use upon successful completion.*/
  oldKey?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface SearchRequest {
  /**List of indices to be searched.*/
  indices?: string[];
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**ElasticSearch filter. Follows the syntax defined in the elastic search manual.*/
  filter: StringAnyMap;
  /**ElasticSearch query. Follows the syntax defined in the elastic search manual.*/
  query?: StringAnyMap;
  /**Sort information*/
  sort: SearchRequestSortField[];
  /**Pagination information*/
  page: Pagination;
  /**The document types to execute the search against. Defaults to be executed against all types.*/
  types: string[];
}

export interface MacroStatement {
  /**Informative text, for the macro creator. You SHOULD always fill this field, as reported errors will include this description.*/
  description: string;
  /**Statement to be executed*/
  exec?: string;
  /**Line number in source file*/
  line: number;
}

export interface MacroLoop {
  /**Informative text, for the macro creator. You SHOULD always fill this field, as reported errors will include this description.*/
  description: string;
  /**Loop variable*/
  var?: string;
  /**Collection to iterate on*/
  items?: string;
  /**Sub steps, sequentially executed*/
  steps?: MacroStep[];
  /**Line number in source file*/
  line: number;
}

export interface ChangePasswordRequest {
  /**Server-provided temporary token to reset a password*/
  token: string;
  /**account key in the realm. (configured 'unique key' used for authentication)*/
  key: string;
  /**New password*/
  password?: string;
}

export interface MacroFunctionResult {
  /**Function evaluation result*/
  result: any;
}

export interface MacroFunctionRequest {
  /**Function name*/
  name?: string;
  /**Function parameter values*/
  params?: any[];
}

export interface DeviceCapabilities {
  /**Resource name of the asking device*/
  askingResource: string;
  /**List of capabilities. Capabilities are developer-defined strings*/
  capabilities: string[];
  /**Resource name of the answering device*/
  answeringResource: string;
}

export interface UserInfoResponse {
  /**Maps user keys to maps of their public data. Note that user data maps may have different formats for different authentication providers*/
  users: StringObjectMap;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId: string;
}

export interface ZetaApiError {
  /**Symbolic error code*/
  code: string;
  /**Human readable message. May vary depending on one or more of locale, input, developer code.*/
  message: string;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId: string;
  /**Developer-generated context. Each code can have a specific context format.*/
  context: any;
  /**Error location, if available*/
  location: string;
}

export interface Grant {
  /**Resource on which the grant applies. For API defined resources, it often has the syntax deploymentId:owner:preciseResource. For example to give access to a gda table, it may look like 'gda_0:wshwWSDOJSD:myTable' , gda_0 being the gda deploymentId, wshwWSDOJSD the data owner, and myTable the table to be shared. For grants on user devices, it can match the resource field used during authentication. You can use the wildcard '*'*/
  resource?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Group id. Must be alphanumerical. You MAY use the wildcard '*' when granting rights.*/
  group?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**Action which will be authorized. For built-in API verbs, it is often the verb itself. You can use the wildcard '*'*/
  action?: string;
}

export interface ExistingUser {
  /**User key within the realm*/
  key?: string;
}

export interface GameJoinResponse {
  /**unique ID for this message, matching the request ID*/
  msgId: string;
  /**response payload*/
  payload: GameJoin;
  /**error message*/
  error: string;
  /**caller ID from the original request*/
  callerId: string;
}

export interface TriggerListener {
  /**Trigger info*/
  trigger?: TriggerId;
  /**Parameter that will be passed to the target verb when called. The format is the format accepted by the target.*/
  parameter: StringAnyMap;
  /**DeploymentId of the target service.*/
  deploymentId?: string;
  /**Verb to be called within the target service.*/
  verb?: string;
  /**Specifies whether this call should generate all expected direct user notifications (primary outputs). Does not affect side-effects (other outputs). Defaults to false*/
  loud: boolean;
}

export interface StackItemRemove {
  /**List of keys of the items to be removed*/
  guids?: Base64EncodedBytes[];
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Stack name.*/
  stack?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface MacroDebugEventTermination {}

export interface UploadedFile {
  /**File mime type*/
  contentType: string;
  /**Metadata, as originally uploaded*/
  meta: StringAnyMap;
  /**File GUID*/
  guid: string;
  /**File path*/
  path: string;
  /**File hash*/
  hash: string;
  /**File size*/
  size: number;
  /**HTTP url*/
  url: string;
}

export interface ZpfsDiskUsage {
  /**File path*/
  path: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Disk usage in bytes*/
  usage: number;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export enum FileType {
  /**EMPTY DESC*/
  FILE = 'FILE',
  /**EMPTY DESC*/
  DIR = 'DIR',
}

export interface ListingEntryInfo {
  /**File tags*/
  tags: string[];
  /**File type*/
  type: FileType;
  /**File name*/
  name: string;
  /**File metadata*/
  metadata: StringAnyMap;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**File creation timestamp*/
  creation: number;
  /**Original upload information*/
  url: UploadedFile;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface FolderListing {
  /**Whether the path exists*/
  exists: boolean;
  /**Folder path*/
  folder: string;
  /**Entries in the folder*/
  entries: PageContent<ListingEntryInfo>;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface FileStatResult {
  /**File path*/
  path: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**File information. Null if file does not exist*/
  entry: ListingEntryInfo;
}

export interface RemoteCommand {
  /**Optional resource name, used to distinguish between two sessions of the same user on different devices. A given device SHOULD provide a resource name, and SHOULD always use the same resource name (it needs to be persisted by the client code)*/
  resource: string;
  /**Resource of the user issuing the command*/
  fromResource: string;
  /**Command to be executed. This is an arbitrary identifier string whose semantics are left to the developer.*/
  cmd?: string;
  /**User issuing the command*/
  from: string;
  /**Optional data payload for the command. This is an arbitrary object whose semantics are left to the developer.*/
  data: StringAnyMap;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export enum HttpClientParseMode {
  /**EMPTY DESC*/
  STRING = 'STRING',
  /**EMPTY DESC*/
  OBJECT = 'OBJECT',
  /**EMPTY DESC*/
  BYTES = 'BYTES',
}

export interface HttpClientTemplate {
  /**Request body. String (passed as is) or complex object (serialized to json)*/
  content: any;
  /**Name of the request template (primary key)*/
  name?: string;
  /**Headers to be sent*/
  headers: HttpClientHeader[];
  /**HTTP method*/
  method?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**How to parse the response content*/
  parseMode?: HttpClientParseMode;
  /**Remote URL. a literal string*/
  url?: string;
}

export interface HttpClientRequest {
  /**Request body. String (passed as is) or complex object (serialized to json)*/
  content: any;
  /**Headers to be sent*/
  headers: HttpClientHeader[];
  /**HTTP method*/
  method?: string;
  /**optional client generated call ID to identify responses*/
  requestId: string;
  /**How to parse the response content*/
  parseMode?: HttpClientParseMode;
  /**Remote URL. a literal string*/
  url?: string;
}

export interface MacroFunctionParam {
  /**Parameter name*/
  name: string;
}

export interface MacroScriptParam {
  /**Parameter name*/
  name: string;
  /**Optional parameter constraints*/
  constraints: MacroScriptParamConstraint[];
}

export interface MacroInfo {
  /**Informative text, for the macro creator. You SHOULD always fill this field, as reported errors will include this description.*/
  description: string;
  /**Target for the response (the syntax is the same as in messaging.send). Overrides 'broadcast' when set.*/
  target: any;
  /**Optional return channel. Defaults to completed*/
  channel: string;
  /**Macro name*/
  name?: string;
  /**Optional macro result*/
  result: StringAnyMap;
  /**Setting this field effectively overrides the __userKey pseudo-constant for the duration of the macro. All non-sudoed internal calls will behave as if sudoed with the given user key. When this field is set, there is not point in calling this macro with sudo*/
  userKey: string;
  /**source file (for debug)*/
  source: string;
  /**Sub steps, sequentially executed*/
  steps?: MacroStep[];
  /**Optional output field specifications*/
  returned: MacroScriptParam[];
  /**Optional parameter specifications*/
  params: MacroScriptParam[];
  /**Whether to broadcast to all the user's sessions, or just to the asking session. Defaults to false (request-response paradigm).*/
  broadcast: boolean;
  /**Line number in source file*/
  line: number;
}

export interface SuMacroPlay {
  /**Macro named parameters*/
  parameters: StringAnyMap;
  /**Key of the impersonated user*/
  suKey?: string;
  /**True if an error should trigger a response on an error channel, or false (the default) if the error should be simply reported in an error field*/
  hardFail: boolean;
  /**Macro name*/
  name?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Temporary macros. This feature does not support concurrent calls.*/
  tempMacros: MacroInfo[];
  /**Deprecated. Use the 'livedebug' API.*/
  debug: number;
}

export interface MacroDebugVariableChange {
  /**Debug token, previously generated by a call to the admin verb 'livedebugToken'*/
  token: string;
  /**Variable name*/
  name?: string;
  /**Frame index, as sent by the server by 'resume'*/
  frame: number;
  /**Variable value*/
  data: any;
}

export interface ImpersonatedTraceableRequest {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface GameStart {
  /**Server attributed game identifier*/
  gameId: string;
}

export interface AggregationItemCategory {
  /**Item type (aggregation behavior).*/
  type?: AggregationItemType;
  /**Item periods, in minutes. Automatic aggregation by this service ensures that these will be the minimum visible granularities. Although you can specify arbitrary values, it is recommended, for easier auto-alignment of period boundaries, to use divisors of well known values : for example 30 (half an hour) is a lot better than 29.*/
  periods?: number[];
  /**Parameter that will be passed to the target verb when called. The format is the format accepted by the target.*/
  parameter: StringAnyMap;
  /**Item category. Arbitrary developer-defined name.*/
  category?: string;
  /**DeploymentId of the target service.*/
  deploymentId?: string;
  /**Verb to be called within the target service.*/
  verb?: string;
  /**Specifies whether this call should generate all expected direct user notifications (primary outputs). Does not affect side-effects (other outputs). Defaults to false*/
  loud: boolean;
}

export interface MacroUploadReport {
  /**List of successfully uploaded macro names*/
  macros: string[];
  /**List of successfully uploaded function names*/
  functions: string[];
}

export interface UserGroup {
  /**The user's key (as in __userKey)*/
  user: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Group id. Must be alphanumerical. You MAY use the wildcard '*' when granting rights.*/
  group?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface MacroFunction {
  /**Informative text, for the macro creator. You SHOULD always fill this field, as reported errors will include this description.*/
  description: string;
  /**Function parameters*/
  parameters: MacroFunctionParam[];
  /**Function name*/
  name?: string;
  /**Function result*/
  result?: any;
  /**source file*/
  source: string;
  /**Sub steps, sequentially executed*/
  steps?: MacroStep[];
  /**Line number in source file*/
  line: number;
}

export interface MacroLocalFunction {
  /**Function definition*/
  f?: MacroFunction;
  /**Informative text, for the macro creator. You SHOULD always fill this field, as reported errors will include this description.*/
  description: string;
  /**Function local name*/
  var?: string;
  /**Line number in source file*/
  line: number;
}

export interface ExistenceCheck {
  /**User key within the realm*/
  key?: string;
  /**Whether to fail is the user does not exist. When true, fails silently.*/
  softFail: boolean;
}

export interface GameRunnerFullLocation {
  /**Session identifier of the game engine. Server-attributed*/
  sessionId: string;
  /**Reserved for future use*/
  requestChannel: string;
  /**Reserved for future use*/
  responseChannel: string;
  /**Seti identifier of the game engine. Server-attributed*/
  setiId: string;
}

export interface ApiTriggerId {
  /**Listener name*/
  name?: string;
  /**Deployment ID of the service verb to listen to.*/
  deploymentId?: string;
  /**Verb to be listened to within the target service.*/
  verb?: string;
}

export interface RdbmsQuery {
  /**Parameters of the query*/
  parameters: any[];
  /**SQL query*/
  statement: string;
}

export interface FileRemoval {
  /**File path*/
  path: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface EventTrigger {
  /**Event name*/
  event: string;
  /**Event data*/
  data: any;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface MacroCompletion {
  /**Execution statistics, when debug is enabled*/
  stats: MacroCompletionStats;
  /**Encountered errors. Error reporting behavior can be changed with the hardFail parameter.*/
  errors: ZetaApiError[];
  /**Macro name*/
  name: string;
  /**Generated result, if applicable*/
  result: any;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId: string;
  /**Generated debug output, if applicable*/
  log: string[];
}

export interface TemplateRequest {
  /**Locale, as defined by IETF BCP 47*/
  languageTag: string;
  /**Template name, as configured by an admin*/
  name?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Data model*/
  data?: StringAnyMap;
}

export interface StackRequest {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Stack name.*/
  stack?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface WorkerAdminRequest {
  /**Parameter (request body)*/
  parameters: any;
  /**Deployment ID of the target service*/
  deploymentId: string;
  /**Verb name inside the service*/
  verb: string;
}

export interface UserSearchRequest {
  /**Optional request ID*/
  requestId: string;
  /**ElasticSearch filter*/
  filter: StringAnyMap;
  /**Elasticsearch query*/
  query?: StringAnyMap;
  /**Pagination information*/
  page: Pagination;
}

export interface WorkflowTemplatePurge {}

export interface GroupRelated {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Group id. Must be alphanumerical. You MAY use the wildcard '*' when granting rights.*/
  group?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface Presence {
  /**User information*/
  user: OwnerResource;
  /**Presence status. OFF or ON*/
  presence: string;
  /**Group information*/
  group: GroupRelated;
}

export interface PagedGroupPresence {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Group id. Must be alphanumerical. You MAY use the wildcard '*' when granting rights.*/
  group?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**List of group users, with their presence information.*/
  presences: PageContent<Presence>;
}

export interface OwnedGroups {
  /**Groups owned by the user.*/
  groups: PageContent<GroupInfo>;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface WorkflowTemplateInfoRequest {
  /**Template name, as created with 'createTemplate'*/
  templateName: string;
}

export interface FileUploadRequest {
  /**Content type (matches the value of the HTTP content type header)*/
  contentType: string;
  /**File path*/
  path: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface GameOrganizationResponse {
  /**unique ID for this message, matching the request ID*/
  msgId: string;
  /**response payload*/
  payload: GameOrganization;
  /**error message*/
  error: string;
  /**caller ID from the original request*/
  callerId: string;
}

export interface GdaCellsRequest {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Table name*/
  table?: string;
  /**Row key*/
  key?: string;
  /**cell keys inside the column*/
  key2?: string[];
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**column name inside the row*/
  column?: string;
}

export interface GdaCellsResult {
  /**Request leading to the result*/
  request: GdaCellsRequest;
  /**Result for the specified request*/
  result: any;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId: string;
}

export interface CheckPasswordRequest {
  /**account key in the realm. (configured 'unique key' used for authentication)*/
  key: string;
  /**Password to be checked*/
  password?: string;
}

export interface GdaColumnRequest {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Table name*/
  table?: string;
  /**Row key*/
  key?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**column name inside the row*/
  column?: string;
}

export interface ServiceVerbCall {
  /**Parameter that will be passed to the target verb when called. The format is the format accepted by the target.*/
  parameter: StringAnyMap;
  /**DeploymentId of the target service.*/
  deploymentId?: string;
  /**Verb to be called within the target service.*/
  verb?: string;
  /**Specifies whether this call should generate all expected direct user notifications (primary outputs). Does not affect side-effects (other outputs). Defaults to false*/
  loud: boolean;
}

export interface FullWorkflowStateDefinition {
  /**Called on the workflow when this state is about to be reached. If the call is a macro, it has the possibility to prevent the transition by returning {'transition':'failed', 'message':'optional error message'}.*/
  call: ServiceVerbCall;
  /**ID of the state*/
  stateId?: string;
  /**State name*/
  stateName: string;
}

export interface MacroDebugToken {
  /**Token suitable for use by debug verbs*/
  token: string;
}

export interface UserSearchResponse {
  /**Maps user keys to maps of their public data. Note that user data maps may have different formats for different authentication providers*/
  users: StringObjectMap;
  /**Request ID, as given by the user*/
  requestId: string;
  /**Requested pagination*/
  page: Pagination;
  /**Total number of users matching the query*/
  totalHits: number;
}

export interface GdaTableRemoval {
  /**Table name*/
  name?: string;
}

export interface NotifiableDeviceRegistration {
  /**Device-specific and app-specific opaque token. The format and meaning is vendor (Apple, Android...) specific. The value is generated by some vendor API on the device for a particular app and will be used by zetapush for notifications.*/
  deviceToken?: string;
  /**Application primary key (as defined in 'createApp')*/
  appId?: string;
}

export interface HttpClientResponse {
  /**received content*/
  content: any;
  /**received headers*/
  headers: HttpClientHeader[];
  /**response http status code*/
  httpStatus: number;
  /**optional client generated call ID to identify responses*/
  requestId: string;
}

export interface SnapshotItem {
  /**Whether to taken case into account. Defaults to false : case is important*/
  caseInsensitive: boolean;
  /**Path of the file to be included.*/
  path: string;
  /**Patterns for files that should be included. Used only when path is a folder*/
  includes: string[];
  /**Patterns for files that should be excluded. Used only when path is a folder. Exclusions have precedence over inclusions*/
  excludes: string[];
}

export interface SnapshotCreationRequest {
  /**Whether to create all non-existing parents. Defaults to false.*/
  parents: boolean;
  /**Folder name*/
  folder?: string;
  /**Items to be copied*/
  items: SnapshotItem[];
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Whether to flatten source paths. Setting this to true might lead to name conflicts*/
  flatten: boolean;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface GrantListItem {
  /**Configured authorized resource*/
  resource: string;
  /**Configured authorized action*/
  action: string;
}

export interface PagedGrantList {
  /**List of granted rights*/
  grants: PageContent<GrantListItem>;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Group id. Must be alphanumerical. You MAY use the wildcard '*' when granting rights.*/
  group?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface GrantList {
  /**List of granted rights*/
  grants: GrantListItem[];
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Group id. Must be alphanumerical. You MAY use the wildcard '*' when granting rights.*/
  group?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface GameJoinWithCallback {
  /**unique ID for this message*/
  msgId: string;
  /**message payload*/
  payload: GameJoin;
  /**callback info*/
  callerId: string;
}

export interface HttpClientCall {
  /**name of the configured template*/
  name?: string;
  /**optional client generated call ID to identify responses*/
  requestId: string;
}

export enum MacroDebugStepType {
  /**EMPTY DESC*/
  STEP_OVER = 'STEP_OVER',
  /**EMPTY DESC*/
  RESUME = 'RESUME',
  /**EMPTY DESC*/
  TERMINATE = 'TERMINATE',
  /**EMPTY DESC*/
  STEP_INTO = 'STEP_INTO',
}

export interface MacroDebugStep {
  /**Debug token, previously generated by a call to the admin verb 'livedebugToken'*/
  token: string;
  /**Step type*/
  type: MacroDebugStepType;
}

export interface GameOrganizationWithCallback {
  /**unique ID for this message*/
  msgId: string;
  /**message payload*/
  payload: GameOrganization;
  /**callback info*/
  callerId: string;
}

export interface GdaPutsResult {
  /**Number of inserted rows*/
  inserted: number;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Table name*/
  table?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export enum TraceType {
  /**EMPTY DESC*/
  MS = 'MS',
  /**EMPTY DESC*/
  ME = 'ME',
  /**EMPTY DESC*/
  CMT = 'CMT',
  /**EMPTY DESC*/
  USR = 'USR',
}

export interface GdaGet {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Table name*/
  table?: string;
  /**Row key*/
  key?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface GdaGetResult {
  /**Request leading to the result*/
  request: GdaGet;
  /**Result for the specified request*/
  result: StringAnyMap;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId: string;
}

export interface SearchDocumentId {
  /**Type name*/
  type?: string;
  /**Document id*/
  id?: string;
  /**Index name*/
  index?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
}

export interface AggregationPushes {
  /**List of items*/
  items?: AggregationPush[];
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface WorkflowTransitionDefinition {
  /**Starting state*/
  from?: string;
  /**Destination state*/
  to?: string;
}

export interface WorkflowTemplate {
  /**All the possible states of this workflow*/
  states?: WorkflowStateDefinition[];
  /**Unique template name*/
  templateName?: string;
  /**All the transitions of this workflow*/
  transitions: WorkflowTransitionDefinition[];
}

export interface WorkflowTransitionInfo {
  /**Workflow ID, as returned by 'create'*/
  workflow?: string;
  /**New state ID when the transition is complete.*/
  newState: string;
  /**Current state of this workflow.*/
  state: string;
  /**User data for this workflow.*/
  userData: any;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Creation timestamp of this workflow.*/
  creation: number;
  /**First state of this workflow.*/
  firstState: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**Template on which this workflow is based.*/
  template: WorkflowTemplate;
}

export interface WorkflowTemplateListResult {
  /**Request leading to the result*/
  request: WorkflowTemplateList;
  /**Result for the specified request*/
  result: PageContent<WorkflowTemplate>;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId: string;
}

export interface UserInfoRequest {
  /**Set of user keys*/
  userKeys?: string[];
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
}

export interface WorkerAdminBulkResponse {
  /**List of responses, in the same order as in the request*/
  responses: any[];
  /**This field might contain a (fatal) error.*/
  error: ZetaApiError;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId: string;
}

export interface Grants {
  /**Resource on which the grant applies. For API defined resources, it often has the syntax deploymentId:owner:preciseResource. For example to give access to a gda table, it may look like 'gda_0:wshwWSDOJSD:myTable' , gda_0 being the gda deploymentId, wshwWSDOJSD the data owner, and myTable the table to be shared. For grants on user devices, it can match the resource field used during authentication. You can use the wildcard '*'*/
  resource?: string;
  /**Actions which will be authorized. For built-in API verbs, it is often the verb itself. You can use the wildcard '*'*/
  actions?: string[];
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Group id. Must be alphanumerical. You MAY use the wildcard '*' when granting rights.*/
  group?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface FolderListingRequest {
  /**Folder path*/
  folder?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**Pagination information*/
  page: Pagination;
}

export interface ConfigurableHttpOutput {
  /**EMPTY DESC*/
  data: any;
}

export enum Type {
  /**EMPTY DESC*/
  BREAK = 'BREAK',
  /**EMPTY DESC*/
  CONTINUE = 'CONTINUE',
}

export interface MacroJump {
  /**Informative text, for the macro creator. You SHOULD always fill this field, as reported errors will include this description.*/
  description: string;
  /**jump type*/
  type?: Type;
  /**Line number in source file*/
  line: number;
}

export interface MacroExecBaseUrl {
  /**EMPTY DESC*/
  url: string;
}

export interface GroupRelatedAndPaged {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Group id. Must be alphanumerical. You MAY use the wildcard '*' when granting rights.*/
  group?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**Pagination information*/
  page: Pagination;
}

export interface TraceablePaginatedImpersonatedRequest {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**Pagination information*/
  page: Pagination;
}

export interface StackListRequest {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Stack name.*/
  stack?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**Pagination information*/
  page: Pagination;
}

export interface MacroDebugBreakpoint {
  /**Line number inside the source file*/
  line: number;
  /**Source file information*/
  location: string;
}

export interface MacroDebugSession {
  /**Macro named parameters*/
  parameters: StringAnyMap;
  /**Debug token, previously generated by a call to the admin verb 'livedebugToken'*/
  token: string;
  /**List of breakpoints for the session*/
  breakpoints: MacroDebugBreakpoint[];
  /**True if an error should trigger a response on an error channel, or false (the default) if the error should be simply reported in an error field*/
  hardFail: boolean;
  /**Macro name*/
  name?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Deprecated. Use the 'livedebug' API.*/
  debug: number;
}

export interface UserMembership {
  /**The user's key (as in __userKey)*/
  user: string;
  /**True if lack of effective membership should be treated as an error. False to return the information as a boolean in the response.*/
  hardFail: boolean;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Group id. Must be alphanumerical. You MAY use the wildcard '*' when granting rights.*/
  group?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface DeviceNotificationSendStatus {
  /**Token for target device*/
  deviceToken: string;
  /**Endpoint for target device*/
  endpoint: string;
  /**Whether the message was sent*/
  success: boolean;
}

export interface GameInfo {
  /**Game description*/
  description: string;
  /**Available commands when playing*/
  commands: StringStringMap;
  /**Game type identifier*/
  name: string;
  /**Available options whan creating*/
  options: StringStringMap;
}

export interface GameRunnerRegistration {
  /**Maximum number of simultaneous games that the registering runner can handle*/
  maxGames: number;
  /**Game Type information*/
  gameInfo?: GameInfo;
  /**Location of the engine. The server will fill it if left null.*/
  location: GameRunnerFullLocation;
}

export interface PingRequest {
  /**The action to probe*/
  action?: string;
}

export interface UserControlRequest {
  /**Public token of the weak you want to control*/
  publicToken: string;
  /**Whether the controlled user/device fully impersonates its controller*/
  fullRights: boolean;
}

export interface ApiTriggerListener {
  /**Trigger info*/
  trigger?: ApiTriggerId;
  /**Parameter that will be passed to the target verb when called. The format is the format accepted by the target.*/
  parameter: StringAnyMap;
  /**DeploymentId of the target service.*/
  deploymentId?: string;
  /**Verb to be called within the target service.*/
  verb?: string;
  /**Specifies whether this call should generate all expected direct user notifications (primary outputs). Does not affect side-effects (other outputs). Defaults to false*/
  loud: boolean;
}

export interface MassTriggers {
  /**List of trigger listeners*/
  triggers: TriggerListener[];
  /**Whether to purge all the already stored listeners before storing the given listeners*/
  purge: boolean;
  /**List of API trigger listeners*/
  apiTriggers: ApiTriggerListener[];
}

export interface WorkerAdminBulkRequest {
  /**List of admin requests*/
  requests: WorkerAdminRequest[];
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
}

export interface CheckPasswordResult {
  /**Whether the password matches*/
  matches: boolean;
  /**account key in the realm. (configured 'unique key' used for authentication)*/
  key: string;
}

export interface ImpersonatedRequest {
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface MacroBlock {
  /**Informative text, for the macro creator. You SHOULD always fill this field, as reported errors will include this description.*/
  description: string;
  /**Sub steps, sequentially executed*/
  steps?: MacroStep[];
  /**Line number in source file*/
  line: number;
}

export interface MacroTest {
  /**Informative text, for the macro creator. You SHOULD always fill this field, as reported errors will include this description.*/
  description: string;
  /**Sub steps, sequentially executed*/
  steps?: MacroStep[];
  /**Else*/
  otherwise: MacroBlock;
  /**Line number in source file*/
  line: number;
  /**Macro step condition. when evaluated to true, allows for execution of the steps*/
  condition?: string;
}

export interface RdbmsSimpleQuery {
  /**SQL query*/
  statement: string;
}

export interface DeviceAvailability {
  /**User inquiring about availability*/
  user: string;
  /**Optional resource name, used to distinguish between two sessions of the same user on different devices. A given device SHOULD provide a resource name, and SHOULD always use the same resource name (it needs to be persisted by the client code)*/
  resource: string;
  /**Whether the device is available or not*/
  available: boolean;
  /**Session id of the answering device*/
  uid: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**Action for which the device's availability is tested*/
  action: string;
}

export enum GdaDataType {
  /**EMPTY DESC*/
  LONG = 'LONG',
  /**EMPTY DESC*/
  STRING = 'STRING',
  /**EMPTY DESC*/
  BOOLEAN = 'BOOLEAN',
  /**EMPTY DESC*/
  DOUBLE = 'DOUBLE',
  /**EMPTY DESC*/
  OBJECT = 'OBJECT',
}

export interface GdaTableColumn {
  /**Column type*/
  type?: GdaDataType;
  /**Column name*/
  name?: string;
  /**False if the column contains a single piece of data or true when it can contain several data, mapped by (sub-)keys. Defaults to 'false'*/
  map: boolean;
}

export interface GdaTableModification {
  /**List of column specifications*/
  columns?: GdaTableColumn[];
  /**Table name*/
  name?: string;
  /**Specify the behavior when the table already exists. The default value is IGNORE_DIFFERENT.IGNORE_IDENTICAL ignores all pre-existing (identical or additional) columns, but does not allow to change or add columns.IGNORE_DIFFERENT ignores all pre-existing (identical or additional) columns, can add columns, but does not allow to change column types.*/
  idempotence: Idempotence;
}

export interface GdaTableStructure {
  /**List of column specifications*/
  columns?: GdaTableColumn[];
  /**Table name*/
  name?: string;
}

export interface MacroVariable {
  /**value to be evaluated*/
  value?: any;
  /**Informative text, for the macro creator. You SHOULD always fill this field, as reported errors will include this description.*/
  description: string;
  /**Variable identifier*/
  var?: string;
  /**Line number in source file*/
  line: number;
}

export interface GroupPresence {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Group id. Must be alphanumerical. You MAY use the wildcard '*' when granting rights.*/
  group?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**List of group users, with their presence information.*/
  presences: Presence[];
}

export interface MacroTypeDefinition {
  /**List of field definitions*/
  fields: MacroScriptParam[];
  /**Type name*/
  name: string;
  /**Initializer. contains class common fields, copied into each new instance*/
  thisObject: StringAnyMap;
}

export interface SoapFaultDefinition {
  /**EMPTY DESC*/
  type?: MacroTypeDefinition;
  /**EMPTY DESC*/
  targetNamespace: string;
}

export interface HttpClientSOAPRequest {
  /**Soap headers : the content of &lt;soapenv:Header&gt;*/
  soapHeaders: any[];
  /**List of possible soap fault classes for this request*/
  soapFaults: SoapFaultDefinition[];
  /**Request body. String (passed as is) or complex object (serialized to json)*/
  content: any;
  /**Type reference, as returned in ZMS by 'YourClassName.class' */
  typeDefinition: MacroTypeDefinition;
  /**Headers to be sent*/
  headers: HttpClientHeader[];
  /**SOAP action, as defined in the WSDL, for inclusion in the generated request headers*/
  soapAction: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Remote URL. a literal string*/
  url?: string;
  /**Use when the xml root type does not declare any namespace, but does need it*/
  requestWrapperNamespace: string;
}

export interface MacroInfos {
  /**List of macros*/
  macros: MacroInfo[];
  /**Whether to wipe out all existing macros before taking the given ones into account*/
  purge: boolean;
  /**List of functions*/
  functions: MacroFunction[];
  /**Deployment ID of the macro service*/
  deploymentId: string;
  /**Global data*/
  globals: StringAnyMap;
  /**List of user types*/
  types: MacroTypeDefinition[];
}

export interface UserSearchConfig {
  /**ES mappings for the 'users' type*/
  usersMapping: StringAnyMap;
  /**ElasticSearch index settings.*/
  settings: StringAnyMap;
}

export interface WorkflowCreationRequest {
  /**Template on which this workflow is based.*/
  templateName?: string;
  /**User data. Put your domain-specific data here. It can be a complex object or a simple reference to something that you store somewhere else.*/
  userData: any;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface SmsMessage {
  /**Sender name*/
  sender: string;
  /**Text message. Standard restrictions for text messages apply*/
  message: string;
  /**List of recipients*/
  receivers: string[];
}

export interface GdaRemoveColumns {
  /**List of column names*/
  columns?: string[];
  /**Table name*/
  name?: string;
}

export interface MacroPlay {
  /**Macro named parameters*/
  parameters: StringAnyMap;
  /**True if an error should trigger a response on an error channel, or false (the default) if the error should be simply reported in an error field*/
  hardFail: boolean;
  /**Macro name*/
  name?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Deprecated. Use the 'livedebug' API.*/
  debug: number;
}

export interface GdaPut {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Table name*/
  table?: string;
  /**stored data*/
  data?: any;
  /**Row key*/
  key?: string;
  /**optional cell key inside the column*/
  key2: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**column name inside the row*/
  column?: string;
}

export interface DeployedItem {
  /**EMPTY DESC*/
  description: string;
  /**EMPTY DESC*/
  enabled: boolean;
  /**EMPTY DESC*/
  businessId?: string;
  /**EMPTY DESC*/
  itemId?: string;
  /**EMPTY DESC*/
  forbiddenVerbs: string[];
  /**EMPTY DESC*/
  deploymentId: string;
  /**EMPTY DESC*/
  options: StringStringMap;
}

export interface WorkerAdminBulkServiceCreation {
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**List of services to be created*/
  services: DeployedItem[];
}

export interface MacroDebugBreakpointSet {
  /**Breakpoint information*/
  breakpoint?: MacroDebugBreakpoint;
  /**Debug token, previously generated by a call to the admin verb 'livedebugToken'*/
  token: string;
  /**Whether the breakpoint is enabled or not*/
  enabled: boolean;
}

export interface ResetRequest {
  /**account key in the realm. (configured 'unique key' used for authentication)*/
  key: string;
}

export interface GdaPutsRow {
  /**Stored data, as a map of columns to values*/
  data?: StringAnyMap;
  /**Row key*/
  key?: string;
}

export interface GdaPuts {
  /**Rows to be inserted*/
  rows?: GdaPutsRow[];
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Table name*/
  table?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface WorkflowTransitionRequest {
  /**Workflow ID, as returned by 'create'*/
  workflow?: string;
  /**Destination state*/
  to?: string;
  /**User data. When not null, used to update the user-data field of the workflow instance*/
  userData: any;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export enum Format {
  /**EMPTY DESC*/
  Y = 'Y',
  /**EMPTY DESC*/
  YMDHMSN = 'YMDHMSN',
  /**EMPTY DESC*/
  YMDHMS = 'YMDHMS',
  /**EMPTY DESC*/
  YMDHMSM = 'YMDHMSM',
  /**EMPTY DESC*/
  YMD = 'YMD',
  /**EMPTY DESC*/
  YMDH = 'YMDH',
  /**EMPTY DESC*/
  YMDHM = 'YMDHM',
  /**EMPTY DESC*/
  YM = 'YM',
}

export interface NotificationMessage {
  /**Resource of the target device (optional. if not given, will notify all devices of the user)*/
  resource: string;
  /**Target user key (as in __userKey)*/
  target?: string;
  /**Data to be sent (map or string). Top-level fields to be included in the message. If data is a string, data will be put in the right, vendor-specific, location in the data structure sent to the device.*/
  data: any;
}

export interface NotifiableApplication {
  /**Vendor-specific credential : 'private key' for APNS, 'API key' for GCM*/
  credential?: string;
  /**Application name, as registered in your vendor-specific management console*/
  applicationName?: string;
  /**Platform type*/
  platform?: NotificationPlatform;
  /**Your vendor-specific principal : 'SSL certificate' (PEM format) for APNS, N/A for GCM*/
  principal: string;
  /**Application primary key, that you choose arbitrarily. If absent, it will default to the value of applicationName*/
  appId: string;
}

export interface QueueTask {
  /**EMPTY DESC*/
  done: boolean;
  /**EMPTY DESC*/
  request: TaskRequest;
  /**EMPTY DESC*/
  businessId: string;
  /**EMPTY DESC*/
  taskId: string;
  /**EMPTY DESC*/
  comet: string;
  /**EMPTY DESC*/
  deploymentId: string;
  /**EMPTY DESC*/
  assignee: OwnerResource;
  /**EMPTY DESC*/
  dispatched: boolean;
}

export interface WorkflowList {
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**Pagination information*/
  page: Pagination;
}

export interface CronTaskDeletion {
  /**cron name identifying the task to be removed*/
  cronName: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface TaskConsumerRegistration {
  /**Task consumer maximum capacity at a given time. The server will not exceed that capacity when dispatching new tasks*/
  capacity: number;
}

export interface NotificationSendStatus {
  /**List of statuses for each target device*/
  report: DeviceNotificationSendStatus[];
  /**Source message*/
  message: NotificationMessage;
}

export interface GrantCheckRequest {
  /**The user needing authorization*/
  user: string;
  /**The resource to check*/
  resource: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**The action to check*/
  action: string;
}

export interface GrantCheckResult {
  /**The request*/
  request: GrantCheckRequest;
  /**True when the check passed*/
  ok: boolean;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId: string;
}

export interface ThumbnailResult {
  /**The file used as base for generating thumbnails*/
  baseFile: UploadedFile;
  /**Generated thumbnails*/
  thumbnails: Thumbnail[];
  /**Generated thumbnails*/
  failed: ZetaApiError[];
}

export interface UserToken {
  /**private token*/
  token: string;
  /**userKey for this user*/
  userKey: string;
  /**public token*/
  publicToken: string;
}

export interface ProvisioningResult {
  /**List of provisioned tokens*/
  users: UserToken[];
}

export interface GdaColumnSpec {
  /**Optional list of cell names*/
  key2: string[];
  /**Mandatory column name*/
  column?: string;
}

export interface GdaFilterRequest {
  /**Optional column/cell specifications of the columns/cells to retrieve*/
  columns: GdaColumnSpec[];
  /**Start row key (inclusive)*/
  start: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Table name*/
  table?: string;
  /**Stop row key (exclusive)*/
  stop: string;
  /**Boolean predicate. The function must accept one parameter : the current row. The return value must be a boolean. When true, the row is retained, otherwise it is filtered out.*/
  function: any;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**Pagination information*/
  page: Pagination;
}

export interface GdaList {
  /**Optional column/cell specifications of the columns/cells to retrieve*/
  columns: GdaColumnSpec[];
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Table name*/
  table?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**Pagination information*/
  page: Pagination;
}

export interface GdaListResult {
  /**Request leading to the result*/
  request: GdaList;
  /**Result for the specified request*/
  result: PageContent<StringAnyMap>;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId: string;
}

export interface GdaFilterResult {
  /**Request leading to the result*/
  request: GdaFilterRequest;
  /**Result for the specified request*/
  result: PageContent<StringAnyMap>;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId: string;
}

export interface GdaRemoveRange {
  /**Optional column/cell specifications of the columns/cells to retrieve*/
  columns: GdaColumnSpec[];
  /**Start row key*/
  start?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Table name*/
  table?: string;
  /**Stop row key*/
  stop?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface GdaRange {
  /**Optional column/cell specifications of the columns/cells to retrieve*/
  columns: GdaColumnSpec[];
  /**Start row key (inclusive)*/
  start?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Table name*/
  table?: string;
  /**Stop row key (exclusive)*/
  stop?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**Pagination information*/
  page: Pagination;
}

export interface GdaRangeResult {
  /**Request leading to the result*/
  request: GdaRange;
  /**Result for the specified request*/
  result: PageContent<StringAnyMap>;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId: string;
}

export interface GdaMultiGetRequest {
  /**Optional column/cell specifications of the columns/cells to retrieve*/
  columns: GdaColumnSpec[];
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Table name*/
  table?: string;
  /**List of wanted row keys*/
  keys?: string[];
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface GdaMultiGetResult {
  /**Request leading to the result*/
  request: GdaMultiGetRequest;
  /**Result for the specified request*/
  result: StringAnyMap[];
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId: string;
}

export interface GdaReduceRequest {
  /**Optional column/cell specifications of the columns/cells to retrieve*/
  columns: GdaColumnSpec[];
  /**Start row key (inclusive)*/
  start?: string;
  /**Initial value for the computation function. Example : {sum:0, mean:null}*/
  initialValue: StringAnyMap;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Table name*/
  table?: string;
  /**Stop row key (exclusive)*/
  stop?: string;
  /**Computation function. The function must accept two parameters : the current value and the current row. The return value is ignored : the current value must be updated instead.*/
  function: any;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**Pagination information*/
  page: Pagination;
}

export interface GdaReduceResult {
  /**Request leading to the result*/
  request: GdaReduceRequest;
  /**Result for the specified request*/
  result: StringAnyMap;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId: string;
}

export interface SearchData {
  /**Type name*/
  type?: string;
  /**Document id*/
  id?: string;
  /**Index name*/
  index?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Document data*/
  data?: StringAnyMap;
}

export interface MacroDebugInfoRequest {
  /**Debug token, previously generated by a call to the admin verb 'livedebugToken'*/
  token: string;
  /**optional path to apply on the result of the evaluation of exp*/
  path: string;
  /**expression to evaluate*/
  exp: string;
  /**request ID*/
  requestId: string;
  /**Frame index, as sent by the server by 'resume'*/
  frame: number;
}

export interface SearchIndex {
  /**Index name*/
  index?: string;
  /**ElasticSearch field mappings*/
  mappings: StringObjectMap;
  /**ElasticSearch index settings.*/
  settings: StringAnyMap;
}

export interface CronTaskListRequest {
  /**Start timestamp for the task list. Not implemented*/
  start: number;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Stop timestamp for the task list. Not implemented*/
  stop: number;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**Pagination information*/
  page: Pagination;
}

export interface FileUploadLocation {
  /**HTTP method, typically POST or PUT*/
  httpMethod: string;
  /**GUID of the uploaded file*/
  guid: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Upload URL for the http client*/
  url: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface WorkflowInfo {
  /**Workflow ID, as returned by 'create'*/
  workflow?: string;
  /**Current state of this workflow.*/
  state: string;
  /**User data for this workflow.*/
  userData: any;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Creation timestamp of this workflow.*/
  creation: number;
  /**First state of this workflow.*/
  firstState: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
  /**Template on which this workflow is based.*/
  template: WorkflowTemplate;
}

export interface GameState {
  /**Current game status*/
  status: GameStatus;
  /**Server attributed game identifier*/
  gameId: string;
  /**Game specific data*/
  data: StringAnyMap;
}

export interface TemplateListRequest {
  /**Pagination information*/
  page: Pagination;
}

export interface JoinedGroups {
  /**Groups joined by the user.*/
  groups: PageContent<GroupInfo>;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface StackItem {
  /**Server-generated GUID*/
  guid: Base64EncodedBytes;
  /**Insertion timestamp*/
  ts: number;
  /**Stored data*/
  data: StringAnyMap;
}

export interface StackListResponse {
  /**Request leading to the result*/
  request: StackListRequest;
  /**Result for the specified request*/
  result: PageContent<StackItem>;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId: string;
}

export interface TemplateCreation {
  /**template name*/
  name?: string;
  /**template contents, as a character string*/
  template?: string;
}

export interface TemplateInfo {
  /**Template name*/
  name: string;
  /**List of languages for which a localization of the template exists*/
  languageTags: string[];
}

export interface TemplateListResult {
  /**Request leading to the result*/
  request: TemplateListRequest;
  /**Result for the specified request*/
  result: PageContent<TemplateInfo>;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId: string;
}

export interface TemplateResult {
  /**Result of template evaluation*/
  content: string;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId: string;
}

export interface CronPlanning {
  /**Cron planning request*/
  request: CronTaskListRequest;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**List of all tasks matching the request*/
  tasks: PageContent<CronTaskRequest>;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export enum TraceLevel {
  /**EMPTY DESC*/
  DEBUG = 'DEBUG',
  /**EMPTY DESC*/
  ERROR = 'ERROR',
  /**EMPTY DESC*/
  TRACE = 'TRACE',
  /**EMPTY DESC*/
  WARN = 'WARN',
  /**EMPTY DESC*/
  INFO = 'INFO',
}

export interface MacroTrace {
  /**Trace context (differentiates client calls)*/
  ctx: number;
  /**Trace type (differentiates client calls)*/
  type: TraceType;
  /**Trace number (monotonous increase)*/
  n: number;
  /**Trace data*/
  data: any;
  /**Line number in the source code.*/
  line: number;
  /**Zetapush key of the user generating the trace*/
  owner: string;
  /**Trace level*/
  level: TraceLevel;
  /**Location of the source code.*/
  location: string;
}

export interface UserGroupMembership {
  /**The user's key (as in __userKey)*/
  user: string;
  /**Whether the user is member of the group*/
  member: boolean;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Group id. Must be alphanumerical. You MAY use the wildcard '*' when granting rights.*/
  group?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface StackItemAdd {
  /**Key of this stack item*/
  guid: Base64EncodedBytes;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Stack name.*/
  stack?: string;
  /**Insertion timestamp*/
  ts: number;
  /**Stored data*/
  data?: StringAnyMap;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface WorkflowTemplateCreation {
  /**All the possible states of this workflow*/
  states?: FullWorkflowStateDefinition[];
  /**Unique template name*/
  templateName?: string;
  /**All the transitions of this workflow*/
  transitions: WorkflowTransitionDefinition[];
}

export interface FileCreationRequest {
  /**Content type (matches the value of the HTTP content type header)*/
  contentType: string;
  /**File tags*/
  tags: string[];
  /**File path*/
  path: string;
  /**File metadata*/
  metadata: StringAnyMap;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Contents. Can be a String (will be stored as UTF-8), a byte array*/
  data?: any;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export enum ChronoUnit {
  /**EMPTY DESC*/
  SECONDS = 'SECONDS',
  /**EMPTY DESC*/
  MICROS = 'MICROS',
  /**EMPTY DESC*/
  FOREVER = 'FOREVER',
  /**EMPTY DESC*/
  CENTURIES = 'CENTURIES',
  /**EMPTY DESC*/
  MILLIS = 'MILLIS',
  /**EMPTY DESC*/
  DAYS = 'DAYS',
  /**EMPTY DESC*/
  HALF_DAYS = 'HALF_DAYS',
  /**EMPTY DESC*/
  MONTHS = 'MONTHS',
  /**EMPTY DESC*/
  WEEKS = 'WEEKS',
  /**EMPTY DESC*/
  HOURS = 'HOURS',
  /**EMPTY DESC*/
  NANOS = 'NANOS',
  /**EMPTY DESC*/
  YEARS = 'YEARS',
  /**EMPTY DESC*/
  DECADES = 'DECADES',
  /**EMPTY DESC*/
  ERAS = 'ERAS',
  /**EMPTY DESC*/
  MILLENNIA = 'MILLENNIA',
  /**EMPTY DESC*/
  MINUTES = 'MINUTES',
}

export interface FolderCreationRequest {
  /**Whether to create all non-existing parents. Defaults to false.*/
  parents: boolean;
  /**Folder name*/
  folder?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface TimerResult {
  /**Timer identifier*/
  id: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner: string;
}

export interface MacroDebugEventVar {
  /**Data value*/
  value: MacroDebugFrameValue;
  /**Data type*/
  type: string;
  /**Evaluated expression, as requested*/
  var: string;
  /**The request may have caused an error*/
  error: ZetaApiError;
  /**request ID*/
  requestId: string;
  /**Frame index, as requested*/
  frame: number;
}

export interface MacroDebugFrameVariable {
  /**Variable value*/
  value: MacroDebugFrameValue;
  /**Variable type*/
  type: string;
  /**Variable name*/
  name: string;
}

export interface MacroDebugFrame {
  /**Variables*/
  vars: MacroDebugFrameVariable[];
  /**Macro name*/
  macroName: string;
  /**Line number*/
  line: number;
  /**Source location*/
  location: string;
}

export interface MacroDebugFrameValue {
  /**Actual value, for primitive types. Size for complex types*/
  value: any;
  /**Sub fields, for complex types*/
  vars: MacroDebugFrameVariable[];
  /**Value type*/
  type: string;
}

export interface MacroDebugEventPause {
  /**Stack frames*/
  frames: MacroDebugFrame[];
  /**Whether it is possible to step into.*/
  stepIntoPossible: boolean;
  /**Line number*/
  line: number;
  /**Source location*/
  location: string;
}

export interface Message {
  /**Target user or group. Can be either a string, an array of string or an object that contains an array of string. The 'target' property of the output message will have exactly the same form.*/
  target?: ListOrSingle;
  /**Optional (alphanumeric) channel name*/
  channel: string;
  /**User key of the message sender*/
  source: string;
  /**Data to be sent*/
  data?: StringAnyMap;
}
