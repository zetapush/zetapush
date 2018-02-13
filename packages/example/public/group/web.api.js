const DEFAULT_GROUP_TYPE = 'group';

const getDeploymentIdByService = (service) => Object.getPrototypeOf(service).constructor.DEFAULT_DEPLOYMENT_ID

class Group {
  constructor(id, deploymentId, name, owner, resource, members, metadata, tags) {
    this.id = id;
    this.deploymentId = deploymentId;
    this.name = name;
    this.owner = owner;
    this.resource = resource;
    this.members = members;
    this.metadata = metadata;
    this.tags = tags;
  }
}

class GroupMember {
  constructor(id, member, resource) {
    this.id = id;
    this.member = member;
    this.resource = resource;
  }
}

class GroupMembership {
  constructor(member) {
    this.member = member;
  }
}

class Gda extends ZetaPush.services.Gda {
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'cr_grp_gda';
  }
}

class GroupManagement extends ZetaPush.services.GroupManagement {
  static get DEFAULT_DEPLOYMENT_ID() {
    return 'cr_grp_groups';
  }
  listDetailedOwnedGroups({ owner, page } = {}) { return this.$publish('listDetailedOwnedGroups', { owner, page }); }
  listOwnedGroups({ owner, page } = {}) { return this.$publish('listOwnedGroups', { owner, page }); }
  listGroupGrants({ group, owner, page } = {}) { return this.$publish('listGroupGrants', { group, owner, page }); }
  listJoinedGroups({ group, owner, page } = {}) { return this.$publish('listJoinedGroups', { group, owner, page }); }
}

class UserDirectory extends ZetaPush.services.Userdir { }

window.Api = class Api {
  static get injected() {
    return [Gda, GroupManagement, UserDirectory];
  }
  constructor(zpServiceGda, zpServiceGroups, zpServiceUserDirectory) {
    console.log('Api:constructor', zpServiceGda, zpServiceGroups, zpServiceUserDirectory);
    this.zpServiceGda = zpServiceGda;
    this.zpServiceGroups = zpServiceGroups;
    this.zpServiceUserDirectory = zpServiceUserDirectory;
  }
  async addGroupMember({
    id,
    member
  }) {
    /** Delegated add user in group */
    const response = await this.core_group__addGroupMemberByService({
      id,
      member,
      zpService: this.zpServiceGroups
    });
    return response;
  }
  async createGroup({
    id,
    name,
    members,
    metadata,
    tags
  }) {
    const response = await this.core_group__createGroupByService({
      id,
      name,
      members,
      metadata,
      tags,
      zpService: this.zpServiceGroups
    });
    return response;
  }
  async deleteGroup({
    id
  }) {
    const response = await this.core_group__deleteGroupByService({
      id,
      zpService: this.zpServiceGroups
    });
    return response;
  }
  async getGroup({
    id
  }) {
    const response = await this.core_group__getGroupByService({
      id,
      zpService: this.zpServiceGroups
    });
    return response;
  }
  async getGroupList() {
    /** Get group list from API */
    const { groups } = await this.zpServiceGroups.listDetailedOwnedGroups({});
    /** Delegate get all user groups */
    const response = await this.core_group__getGroupListByService({
      groups: groups.content,
      zpService: this.zpServiceGroups
    });
    return response;
  }
  async getUserGroupList() {
    /** Get group list from API */
    const { groups } = this.zpServiceGroups.listOwnedGroups();
    /** Delegate get all my groups */
    const response = await this.core_group__getGroupListByService({
      groups: groups.content,
      zpService: this.zpServiceGroups
    });
    return response;
  }
  async isMemberOf({
    id,
    owner,
    isHardFail
  }) {
    const response = await this.core_group__isMemberOfByService({
      id,
      owner,
      isHardFail,
      zpService: this.zpServiceGroups
    });
    return response;
  }
  async removeGroupMember({
    id,
    member
  }) {
    /** Delegated remove user from a group */
    const response = await this.core_group__removeGroupMemberByService({
      id,
      member,
      zpService: this.zpServiceGroups
    });
    return response;
  }
  async core_group__addGroupMemberByService({
    id,
    member,
    zpService
  }) {
    /** Add user in group */
    await zpService.addUser({
      user: member,
      group: id
    });
    /** Group fully qualified resource */
    const resource = `${getDeploymentIdByService(zpService)}:__userKey:${id}`;
    const membership = new GroupMember(id, member, resource);
    return membership;
  }
  async core_group__createGroupByService({
    id,
    name,
    members,
    metadata,
    tags,
    zpService
  }) {
    /** Merge metadata */
    metadata = {
      ...metadata,
      createdAt: Date.now(),
      type: metadata.type || DEFAULT_GROUP_TYPE
    };
    const existence = await zpService.exists({
      group: id
    });
    const resource = `${'__userKey'}:${id}`;
    /** Avoid error if group already exist */
    if (!existence.exists) {
      /** Create group */
      await zpService.createGroup({
        group: id,
        groupName: name
      });

      /** Set group metadata */
      // await zpRecipeUtils:: setMetadata({ id, metadata });

      /** Set group tags */
      // await zpRecipeUtils:: setTags({ id, tags });
    }
    /** Allow members to list members */
    await zpService.grant({
      action: 'LIST',
      group: id,
      resource: resource
    });
    if (members.length) {
      /** Add initial users to the group */
      const promises = members.map((member) => zpService.addUser({
        group: id,
        user: member
      }))
      await Promise.all(promises);
    }
    /** Get the created group */
    const response = await this.core_group__getGroupByService({ id, zpService });
    return response
  }
  async core_group__getGroupListByService({
    groups,
    zpService
  }) {
    const promises = groups.map((item) => this.core_group__getGroupByService({
      id: item.group,
      zpService
    }));
    const list = await Promise.all(promises);
    return list;
  }
  async core_group__deleteGroupByService({
    id,
    zpService
  }) {
    const existence = await zpService.exists({
      group: id
    });
    /** Avoid error if group not exist */
    if (existence.exists) {
      /** Create group */
      await zpService.delGroup({
        group: id
      });

      /** Delete stored metadata */
      // await zpRecipeUtils::removeMetadata({ id });

      /** Delete stored tags */
      // await zpRecipeUtils::removeTags({ id });
    }
  }
  async core_group__getGroupByService({
    id,
    zpService
  }) {
    const { groupName, owner, users } = await zpService.groupUsers({ group: id });
    const group = new Group(
      id,
      getDeploymentIdByService(zpService),
      groupName,
      owner,
      `${getDeploymentIdByService(zpService)}:${owner}:${id}`,
      users,
      {},
      []
    );
    if (group.members.length > 0) {
      const userKeys = Array.from(new Set(group.members));
      const users = await this.zpServiceUserDirectory.userInfo({ userKeys });
      group.members = Object.entries(users).reduce((list, [userKey, user]) => {
        user.userKey = userKey;
        list.push(user);
        return list;
      }, []);
    }
    /** Get group metadata */
    // const metadata = await zpRecipeUtils::getMetadata({ id });
    // group.metadata = metadata.value;
    /** Get group tags */
    // const tags = await zpRecipeUtils::getTags({ id });
    // group.tags = tags.value;
    return group;
  }
  async core_group__isMemberOfByService({
    id,
    owner,
    isHardFail,
    zpService
  }) {
    /** Assert only admins can create execute macro */
    const { member } = await zpService.memberOf({
      hardFail: isHardFail,
      group: id,
      owner: owner
    });
    const membership = new GroupMembership(member);
    return membership;
  }
  async core_group__removeGroupMemberByService({
    id,
    member,
    zpService
  }) {
    /** Remove user from a group */
    zpService.delUser({
      user: member,
      group: id
    });
    /** Group fully qualified resource */
    const resource = `${getDeploymentIdByService(zpService)}:__userKey:${id}`;
    const membership = new GroupMember(id, member, resource);
    return membership;
  }
}
