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
import {
  FileCreationRequest,
  ZpfsFileHandler,
  ZpfsToken,
} from './Zpfs_hdfsTypes';

/**
 * Upload: local
 *
 * Upload service with local HDFS storage
 * */
export class Zpfs_hdfs extends Service {
  /**
   * Get deployment type associated to Zpfs_hdfs service
   * @return {string}
   */
  static get DEPLOYMENT_TYPE() {
    return 'zpfs_hdfs';
  }
  /**
   * Get default deployment id associated to Zpfs_hdfs service
   * @return {string}
   */
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'zpfs_hdfs_0';
  }
  /**
   * User API for local file management
   *
   * User API for file content manipulation
   * User API for virtual file management and http file upload
   * This API contains all the verbs needed to browse, upload and remove files.
   * Files are stored on a per-user basis: each user has his or her own whole virtual filesystem.
   * Uploading a file is a 3-step process : request an upload URL, upload via HTTP, notify this service of completion.
   * @access public
   * */
  cp(body: CreatedFile): Promise<CreatedFile> {
    return this.$publish('cp', body);
  }
  create(body: FileCreationRequest): Promise<ListingEntryInfo> {
    return this.$publish('create', body);
  }
  du(body: ZpfsRequest): Promise<ZpfsDiskUsage> {
    return this.$publish('du', body);
  }
  freeUploadUrl(body: FileUploadRequest): Promise<FileUploadLocation> {
    return this.$publish('freeUploadUrl', body);
  }
  link(body: CreatedFile): Promise<CreatedFile> {
    return this.$publish('link', body);
  }
  ls(body: FolderListingRequest): Promise<FolderListing> {
    return this.$publish('ls', body);
  }
  mkdir(body: FolderCreationRequest): Promise<CreatedFile> {
    return this.$publish('mkdir', body);
  }
  mv(body: CreatedFile): Promise<CreatedFile> {
    return this.$publish('mv', body);
  }
  newFile(body: FileUploadComplete): Promise<ListingEntryInfo> {
    return this.$publish('newFile', body);
  }
  newUploadUrl(body: FileUploadRequest): Promise<FileUploadLocation> {
    return this.$publish('newUploadUrl', body);
  }
  open(body: ZpfsRequest): Promise<ZpfsFileHandler> {
    return this.$publish('open', body);
  }
  readToken(body: ZpfsRequest): Promise<ZpfsToken> {
    return this.$publish('readToken', body);
  }
  rm(body: FileRemoval): Promise<FileRemoval> {
    return this.$publish('rm', body);
  }
  snapshot(body: SnapshotCreationRequest): Promise<CreatedFile> {
    return this.$publish('snapshot', body);
  }
  stat(body: FileStatRequest): Promise<FileStatResult> {
    return this.$publish('stat', body);
  }
  updateMeta(body: FileMetaUpdate): Promise<ListingEntryInfo> {
    return this.$publish('updateMeta', body);
  }
}
