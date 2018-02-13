const services = require('./services');

const COLUMN_STORED_OBJECT_VALUE = 'Value';
const COLUMN_STORED_OBJECT_REVISION = 'Revision';
const COLUMN_STORED_OBJECT_UPDATE = 'Update';

const TABLE_METADATA = 'ZetaPushMetadata';
const TABLE_TAGS = 'ZetaPushTags';
const TABLE_TARGETS = 'ZetaPushTargets';

const toMap = (list) => {
  const digits = String(list.length).length;
  return list.reduce((map, value, index) => ({
    ...map,
    [String(index).padStart(digits, "0")]: value
  }), Object.create(null))
}

class Storable {
  constructor(id, revision, update) {
    this.id = id;
    this.revision = revision;
    this.update = update;
  }
}

class Metadata extends Storable {
  constructor(id, revision, update, value) {
    super(id, revision, update);
    this.value = value;
  }
}

class StoredObject extends Storable {
  constructor(id, revision, update, value) {
    super(id, revision, update);
    this.value = value;
  }
}

class Tags extends Storable {
  constructor(id, revision, update, value) {
    super(id, revision, update);
    this.value = value;
  }
}

class Targets extends Storable {
  constructor(id, revision, update, value) {
    super(id, revision, update);
    this.value = value;
  }
}

class Gda extends services.Gda {
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'cr_tls_gda';
  }
}

module.exports = class Api {
  static get injected() {
    return [Gda];
  }
  constructor(zpServiceGda) {
    console.log('Api:constructor', zpServiceGda);
    this.zpServiceGda = zpServiceGda;
  }
  async getMetadata({ id }) {
    /** Get Stored Object */
    const { revision, update, value } = await this.getStoredObject({
      id,
      table: TABLE_METADATA,
      zpService: this.zpServiceGda
    });
    return new Metadata(id, revision, update, value);
  }
  async removeMetadata({ id }) {
    await this.removeStoredObject({
      id,
      table: TABLE_METADATA,
      zpService: this.zpServiceGda
    });
    return id;
  }
  async setMetadata({ id, metadata }) {
    /** Store metadata */
    const { revision, update, value } = await this.setStoredObject({
      id,
      value: metadata,
      table: TABLE_METADATA,
      zpService: this.zpServiceGda
    });
    return new Metadata(id, revision, update, value);
  }
  async getTags({ id }) {
    /** Get Stored Object */
    const { revision, update, value } = await this.getStoredObject({
      id,
      table: TABLE_TAGS,
      zpService: this.zpServiceGda
    });
    return new Tags(id, revision, update, Object.values(value));
  }
  async removeTags({ id }) {
    await this.removeStoredObject({
      id,
      table: TABLE_TAGS,
      zpService: this.zpServiceGda
    });
    return id;
  }
  async setTags({ id, tags }) {
    /** Store tags */
    const { revision, update, value } = await this.setStoredObject({
      id,
      value: toMap(tags),
      table: TABLE_TAGS,
      zpService: this.zpServiceGda
    });
    return new Tags(id, revision, update, value);
  }
  async getTargets({ id }) {
    /** Get Stored Object */
    const { revision, update, value } = await this.getStoredObject({
      id,
      table: TABLE_TARGETS,
      zpService: this.zpServiceGda
    });
    return new Targets(id, revision, update, Object.values(value));
  }
  async removeTargets({ id }) {
    await this.removeStoredObject({
      id,
      table: TABLE_TARGETS,
      zpService: this.zpServiceGda
    });
    return id;
  }
  async setTargets({ id, targets }) {
    /** Store targets */
    const { revision, update, value } = await this.setStoredObject({
      id,
      value: toMap(targets),
      table: TABLE_TARGETS,
      zpService: this.zpServiceGda
    });
    return new Targets(id, revision, update, value);
  }
  async getStoredObject({
    id,
    table,
    zpService
  }) {
    console.log('getStoredObject', { id, table, zpService });
    /** Get stored config entry */
    const { result } = await zpService.get({
      key: id,
      table: table
    });
    console.log('getStoredObject', { result });
    /** Destructure result properties */
    const value = result[COLUMN_STORED_OBJECT_VALUE];
    const revision = result[COLUMN_STORED_OBJECT_REVISION];
    const update = result[COLUMN_STORED_OBJECT_UPDATE];

    return new StoredObject(id, revision, update, value);
  }
  async removeStoredObject({
    id,
    table,
    zpService
  }) {
    /** Get stored config entry */
    await zpService.removeRow({
      key: id,
      table
    })
    return id;
  }
  async setStoredObject({
    id,
    value,
    table,
    zpService
  }) {
    console.log('setStoredObject', { id, value, table, zpService });
    /** Stored value */
    await zpService.puts({
      table,
      rows: [{
        key: id,
        data: {
          [COLUMN_STORED_OBJECT_VALUE]: value,
          [COLUMN_STORED_OBJECT_UPDATE]: Date.now()
        }
      }]
    });
    console.log('setStoredObject', {
      'puts:done': true
    });
    /** Set new revision */
    await zpService.inc({
      table,
      column: COLUMN_STORED_OBJECT_REVISION,
      data: 1,
      key: id
    });
    console.log('setStoredObject', {
      'inc:done': true
    });
    /** Get created config */
    const stored = await this.getStoredObject({ id, table, zpService });
    return stored
  }
}