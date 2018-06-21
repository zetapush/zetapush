import { Service } from '../core/index';

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
    return `${Zpfs_hdfs.DEPLOYMENT_TYPE}_0`;
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
