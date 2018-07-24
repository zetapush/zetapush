import { Service } from '../Core/index';
import {
  CreatedFile,
  FileMetaUpdate,
  FileRemoval,
  FileStatRequest,
  FileStatResult,
  FileUploadComplete,
  FileUploadLocation,
  FileUploadRequest,
  FolderCreationRequest,
  FolderListing,
  FolderListingRequest,
  ListingEntryInfo,
  SnapshotCreationRequest,
  ZpfsDiskUsage,
  ZpfsRequest,
} from '../CommonTypes';

/**
 * Upload: pseudo-S3
 *
 * Upload service with pseudo-S3compatible storage
 * */
export class Zpfs_s3compat extends Service {
  /**
   * Get deployment type associated to Zpfs_s3compat service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'zpfs_s3compat';
  }
  /**
   * Get default deployment id associated to Zpfs_s3compat service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'zpfs_s3compat_0';
  }
  /**
   * User API for file management
   *
   * User API for virtual file management and http file upload
   * This API contains all the verbs needed to browse, upload and remove files.
   * Files are stored on a per-user basis: each user has his or her own whole virtual filesystem.
   * Uploading a file is a 3-step process : request an upload URL, upload via HTTP, notify this service of completion.
   * @access public
   * */
  /**
   * Copies a file
   *
   * Copies a file or folder (recursively) to a new location.
   * May fail if the target location is not empty.
   * @access public
   * */
  cp(body: CreatedFile): Promise<CreatedFile> {
    return this.$publish('cp', body);
  }
  /**
   * Returns disk usage
   *
   * Returns an recursively aggregated number of used bytes, starting at the given path.
   * @access public
   * */
  du(body: ZpfsRequest): Promise<ZpfsDiskUsage> {
    return this.$publish('du', body);
  }
  /**
   * Requests an upload URL without constraints.
   *
   * @access public
   * */
  freeUploadUrl(body: FileUploadRequest): Promise<FileUploadLocation> {
    return this.$publish('freeUploadUrl', body);
  }
  /**
   * Links a file
   *
   * Links a file or folder to another location.
   * May fail if the target location is not empty.
   * @access public
   * */
  link(body: CreatedFile): Promise<CreatedFile> {
    return this.$publish('link', body);
  }
  /**
   * Lists a folder content
   *
   * Returns a paginated list of the folder's content.
   * @access public
   * */
  ls(body: FolderListingRequest): Promise<FolderListing> {
    return this.$publish('ls', body);
  }
  /**
   * Creates a folder
   *
   * Creates a new folder.
   * May fail if the target location is not empty.
   * @access public
   * */
  mkdir(body: FolderCreationRequest): Promise<CreatedFile> {
    return this.$publish('mkdir', body);
  }
  /**
   * Moves a file
   *
   * Moves a file or folder (recursively) to a new location.
   * May fail if the target location is not empty.
   * @access public
   * */
  mv(body: CreatedFile): Promise<CreatedFile> {
    return this.$publish('mv', body);
  }
  /**
   * Notifies of upload completion
   *
   * The client application calls this verb to notify that it's done uploading to the cloud.
   * Calling that verb MAY trigger additional events such as thumbnail/metadata creation.
   * @access public
   * */
  newFile(body: FileUploadComplete): Promise<ListingEntryInfo> {
    return this.$publish('newFile', body);
  }
  /**
   * Requests an upload URL
   *
   * Requests an HTTP upload URL.
   * The URL contains temporary credentials (typically valid for a few minutes) and is meant for immediate use.
   * @access public
   * */
  newUploadUrl(body: FileUploadRequest): Promise<FileUploadLocation> {
    return this.$publish('newUploadUrl', body);
  }
  /**
   * Removes a file
   *
   * Removes a file or folder (recursively).
   * @access public
   * */
  rm(body: FileRemoval): Promise<FileRemoval> {
    return this.$publish('rm', body);
  }
  /**
   * Creates a snapshot in a new folder
   *
   * Creates a new folder and then copies the given files inside
   * @access public
   * */
  snapshot(body: SnapshotCreationRequest): Promise<CreatedFile> {
    return this.$publish('snapshot', body);
  }
  /**
   * Returns information about a file
   *
   * Returns information about a single file.
   * The entry field will be null if the path does not exist
   * @access public
   * */
  stat(body: FileStatRequest): Promise<FileStatResult> {
    return this.$publish('stat', body);
  }
  /**
   * Updates a file's metadata
   *
   * @access public
   * */
  updateMeta(body: FileMetaUpdate): Promise<ListingEntryInfo> {
    return this.$publish('updateMeta', body);
  }
}
