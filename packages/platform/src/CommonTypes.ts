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

export enum Idempotence {
  /**The operation will not fail if the entity already exists in a different and compatible form.*/
  IGNORE_DIFFERENT = 'IGNORE_DIFFERENT',
  /**The operation will fail if the entity already exists*/
  FAIL_IF_EXISTING = 'FAIL_IF_EXISTING',
  /**The operation will not fail if the entity already exists in a similar form.*/
  IGNORE_IDENTICAL = 'IGNORE_IDENTICAL'
}

export enum PageDirection {
  /**Descending order*/
  DESC = 'DESC',
  /**Ascending order*/
  ASC = 'ASC'
}
export interface Pagination {
  /**Page size (minimum 1)*/
  pageSize?: number;
  /**Page number (zero-based)*/
  pageNumber?: number;
  /**Sort direction. Default is ASC when not specified.*/
  direction?: PageDirection;
}

export interface PageContent<T> {
  /** Content */
  content: T[];
  /** Pagination information */
  page: Pagination;
}

export type ListOrSingle = string | string[];

export interface CreatedFile {
  /**Old name (if applicable)*/
  oldPath?: string;
  /**File path*/
  path?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
export interface FileMetaUpdate {
  /**File path*/
  path?: string;
  /**Metadata to be processed and updated. Values are translated from GUIDs to URLs by the underlying storage provider*/
  metadataFiles?: StringStringMap;
  /**Metadata to be updated*/
  metadata?: StringAnyMap;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
export interface FileRemoval {
  /**File path*/
  path?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
export interface FileStatRequest {
  /**File path*/
  path?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
export interface FileStatResult {
  /**File path*/
  path?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
  /**File information. Null if file does not exist*/
  entry?: ListingEntryInfo;
}
export enum FileType {
  /**Normal file*/
  FILE = 'FILE',
  /**Directory. May contain other files.*/
  DIR = 'DIR'
}
export interface FileUploadComplete {
  /**File tags*/
  tags?: string[];
  /**File GUID*/
  guid: string;
  /**File metadata*/
  metadata?: StringAnyMap;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
export interface FileUploadLocation {
  /**HTTP method, typically POST or PUT*/
  httpMethod?: string;
  /**GUID of the uploaded file*/
  guid?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Upload URL for the http client*/
  url?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
export interface FileUploadRequest {
  /**Content type (matches the value of the HTTP content type header)*/
  contentType?: string;
  /**File path*/
  path?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
export interface FolderCreationRequest {
  /**Whether to create all non-existing parents. Defaults to false.*/
  parents?: boolean;
  /**Folder name*/
  folder: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
export interface FolderListing {
  /**Whether the path exists*/
  exists?: boolean;
  /**Folder path*/
  folder?: string;
  /**Entries in the folder*/
  entries?: PageContent<ListingEntryInfo>;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
export interface FolderListingRequest {
  /**Folder path*/
  folder: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
  /**Pagination information*/
  page?: Pagination;
}
export interface ListingEntryInfo {
  /**File tags*/
  tags?: string[];
  /**File type*/
  type?: FileType;
  /**File name*/
  name?: string;
  /**File metadata*/
  metadata?: StringAnyMap;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**File creation timestamp*/
  creation?: number;
  /**Original upload information*/
  url?: UploadedFile;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
export interface MacroScriptParam {
  /**Parameter name*/
  name?: string;
  /**Optional parameter constraints*/
  constraints?: MacroScriptParamConstraint[];
}
export interface MacroScriptParamConstraint {
  /**Constraint configuration*/
  config?: StringAnyMap;
  /**Constraint name*/
  name?: string;
}
export interface MacroTypeDefinition {
  /**List of field definitions*/
  fields?: MacroScriptParam[];
  /**Type name*/
  name?: string;
  /**Initializer. contains class common fields, copied into each new instance*/
  thisObject?: StringAnyMap;
}
export interface OwnerResource {
  /**Optional resource name, used to distinguish between two sessions of the same user on different devices. A given device SHOULD provide a resource name, and SHOULD always use the same resource name (it needs to be persisted by the client code)*/
  resource?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
export interface SnapshotCreationRequest {
  /**Whether to create all non-existing parents. Defaults to false.*/
  parents?: boolean;
  /**Folder name*/
  folder: string;
  /**Items to be copied*/
  items?: SnapshotItem[];
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Whether to flatten source paths. Setting this to true might lead to name conflicts*/
  flatten?: boolean;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
export interface SnapshotItem {
  /**Whether to taken case into account. Defaults to false : case is important*/
  caseInsensitive?: boolean;
  /**Path of the file to be included.*/
  path?: string;
  /**Patterns for files that should be included. Used only when path is a folder*/
  includes?: string[];
  /**Patterns for files that should be excluded. Used only when path is a folder. Exclusions have precedence over inclusions*/
  excludes?: string[];
}
export interface UploadedFile {
  /**File mime type*/
  contentType?: string;
  /**Metadata, as originally uploaded*/
  meta?: StringAnyMap;
  /**File GUID*/
  guid?: string;
  /**File path*/
  path?: string;
  /**File hash*/
  hash?: string;
  /**File size*/
  size?: number;
  /**HTTP url*/
  url?: string;
}
export interface ZetaApiError {
  /**Symbolic error code*/
  code?: string;
  /**Human readable message. May vary depending on one or more of locale, input, developer code.*/
  message?: string;
  /**User field for traceability of requests. The value was generated by the client requester.*/
  requestId?: string;
  /**Developer-generated context. Each code can have a specific context format.*/
  context?: any;
  /**Error location, if available*/
  location?: string;
}
export interface ZpfsDiskUsage {
  /**File path*/
  path?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Disk usage in bytes*/
  usage?: number;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
export interface ZpfsRequest {
  /**File path*/
  path?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
