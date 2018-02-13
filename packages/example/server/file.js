const services = require('./services');

class FileEntry {
  constructor(exists, entry) {
    this.exists = exists;
    this.entry = entry;
  }
}

class FileEntryInfo {
  constructor(name, type, file, creation, metadata, tags, owner) {
    this.name = name;
    this.type = type;
    this.file = file;
    this.creation = creation;
    this.metadata = metadata;
    this.tags = tags;
    this.owner = owner;
  }
}

class FileEntryList {
  constructor(exists, folder, entries, owner) {
    this.exists = exists;
    this.folder = folder;
    this.entries = entries;
    this.owner = owner;
  }
}

class FileUploadRequest {
  constructor(contentType, httpMethod, guid, url, owner) {
    this.contentType = contentType;
    this.httpMethod = httpMethod;
    this.guid = guid;
    this.url = url;
    this.owner = owner;
  }
}

class Hdfs extends services.Zpfs_hdfs {
  static get DEFAULT_DEPLOYMENT_ID() {
    return `cr_fl_hdfs`;
  }
}

module.exports = class Api {
  static get injected() {
    return [Hdfs];
  }
  constructor(zpServiceFile) {
    console.log('Api:constructor', zpServiceFile);
    this.zpServiceFile = zpServiceFile;
  }
  async confirmFileUpload({
    guid,
    owner,
    actions,
    metadata,
    tags
  }) {
    /** Confirm file upload */
    const response = await this.core_file__confirmFileUploadByService({
      guid,
      owner,
      actions,
      metadata,
      tags,
      zpService: this.zpServiceFile
    });
    return response;
  }
  async deleteFileEntry({
    path,
    owner
  }) {
    /** Confirm file entry deletion */
    const response = await this.core_file__deleteFileEntryByService({
      path,
      owner,
      zpService: this.zpServiceFile
    });
    return response;
  }
  async getFileEntry({
    path,
    owner
  }) {
    const response = await this.core_file__getFileEntryByService({
      path,
      owner,
      zpService: this.zpServiceFile
    });
    return response;
  }
  async getFileEntryList({
    folder,
    owner
  }) {
    const response = await this.core_file__getFileEntryListByService({
      folder,
      owner,
      zpService: this.zpServiceFile
    });
    return response;
  }
  async requestFileUpload({
    contentType,
    folder,
    owner
  }) {
    const response = await this.core_file__requestFileUploadByService({
      contentType,
      folder,
      owner,
      zpService: this.zpServiceFile
    });
    return response;
  }

  async core_file__confirmFileUploadByService({
    guid,
    owner,
    actions,
    metadata,
    tags,
    zpService
  }) {
    /** Confirm file upload */
    const { type, name, creation, url } = await zpService.newFile({ guid, owner, metadata });
    /** Get file entry */
    const file = new FileEntryInfo(name, type, url, creation, metadata, tags, owner);
    return file;
  }
  async core_file__deleteFileEntryByService({
    path,
    owner,
    zpService
  }) {
    /** Remove file */
    await zpService.rm({
      path,
      owner
    });
    return { path, owner }
  }
  async core_file__getFileEntryByService({
    path,
    owner,
    zpService
  }) {
    /** List uploaded files */
    const { entry } = await zpService.stat({ path, owner });
    /** Test if file exists */
    const exists = typeof entry === 'object';
    /** Get file entry */
    const file = new FileEntryInfo(entry.name, entry.type, entry.url, entry.creation, entry.metadata, entry.tags, entry.owner);
    /** */
    return new FileEntry(exists, file);
  }
  async core_file__getFileEntryListByService({
    folder,
    owner,
    page,
    zpService
  }) {
    const { exists, entries } = await zpService.ls({ folder, owner, page });
    const list = entries.content.map((entry) => new FileEntryInfo(entry.name, entry.type, entry.url, entry.creation, entry.metadata, entry.tags, entry.owner));
    return new FileEntryList(exists, folder, list, owner);
  }
  async core_file__requestFileUploadByService({
    contentType,
    folder,
    owner,
    zpService
  }) {
    /** Request new upload url end point */
    const { httpMethod, guid, url } = await zpService.newUploadUrl({ contentType, owner, path: folder });
    /** File upload request */
    const request = new FileUploadRequest(contentType, httpMethod, guid, url, owner);
    return request;
  }
}
