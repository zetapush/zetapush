import { trace } from './log';

export enum ServerType {
  WORKER = 'queue_0', // FIXME: temporary hack until multiple workers are fully supported
  FRONT = 'front'
}

export namespace ServerType {
  export function defaultFolderName(type: ServerType) {
    switch (type) {
      case ServerType.WORKER:
        return 'queue_0'; // FIXME: temporary hack until multiple workers are fully supported
      case ServerType.FRONT:
        return 'front';
    }
  }
  export function defaultName(type: ServerType) {
    switch (type) {
      case ServerType.WORKER:
        return 'queue_0'; // FIXME: temporary hack until multiple workers are fully supported
      case ServerType.FRONT:
        return 'front';
    }
  }
}

export interface ServerInfo {
  type: ServerType;
  port: number;
}

export class LocalServerRegistry {
  private servers: { [name: string]: ServerInfo | null } = {};

  register(name: string, info: ServerInfo) {
    trace('register', name, info);
    this.servers[name] = info;
  }

  getServerInfo(name: string) {
    return this.servers[name];
  }

  getServers(type: ServerType) {
    const filtered: { [name: string]: ServerInfo } = {};
    for (let name in this.servers) {
      const s = this.servers[name];
      if (s != null && s.type === type) {
        filtered[name] = s;
      }
    }
    return filtered;
  }
}
