import {
  CreatedFile,
  FileMetaUpdate,
  FileRemoval,
  FileStatRequest,
  FileStatResult,
  FileType,
  FileUploadComplete,
  FileUploadLocation,
  FileUploadRequest,
  FolderCreationRequest,
  FolderListing,
  FolderListingRequest,
  ListingEntryInfo,
  PageContent,
  PageDirection,
  Pagination,
  SnapshotCreationRequest,
  SnapshotItem,
  StringAnyMap,
  StringStringMap,
  UploadedFile,
  ZpfsDiskUsage,
  ZpfsRequest
} from '../CommonTypes';

export interface FileCreationRequest {
  /**Content type (matches the value of the HTTP content type header)*/
  contentType?: string;
  /**File tags*/
  tags?: string[];
  /**File path*/
  path?: string;
  /**File metadata*/
  metadata?: StringAnyMap;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Contents. Can be a String (will be stored as UTF-8), a byte array*/
  data: any;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
export interface ZpfsFileHandler {
  /**Opaque file handler, for use by 'read' calls.*/
  handle?: any;
}
export interface ZpfsToken {
  /**Access token for the folder*/
  token?: string;
  /**File path*/
  path?: string;
  /**User field for traceability of requests. Synchronous SDK APIs use this field for you.*/
  requestId?: string;
  /**Optional User key. When calling the API, defaults to the current (calling) user's primary key. For impersonation purposes, the caller may use the key of another user, provided that the proper authorizations have been given by the impersonated user*/
  owner?: string;
}
