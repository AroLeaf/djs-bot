import {
  Awaitable,
  Client,
  GuildChannel,
  GuildChannelResolvable,
  GuildMember,
  PermissionResolvable,
  User,
} from 'discord.js';


export function permissions(...permissions: PermissionResolvable[]): (entity: any) => boolean {
  return (entity: any) => {
    const member: GuildMember = entity.member;
    const channel: GuildChannel = entity.channel;
    if (!member) return false;
    const memberPermissions = entity.memberPermissions || channel ? member.permissionsIn(channel as GuildChannelResolvable) : member.permissions;
    return memberPermissions.has(permissions);
  }
}

export function botPermissions(...permissions: PermissionResolvable[]): (entity: any) => boolean {
  return (entity: any) => {
    const self: GuildMember = entity.guild?.members.me;
    if (!self) return false;
    const channel: GuildChannel = entity.channel;
    const selfPermissions = channel ? self.permissionsIn(channel as GuildChannelResolvable) : self.permissions;
    return selfPermissions.has(permissions);
  }
}

export function ownerOnly(entity: any): boolean {
  const client: Client = entity.client;
  const user: User = entity.user || entity.author;
  return client.owners?.includes(user.id);
}

export function guildOnly(entity: any): boolean {
  return !!entity.guild;
}


export function some(...predicates: ((entity: any) => Awaitable<any>)[]): (entity: any) => Promise<boolean> {
  return async (entity: any) => {
    const results = await Promise.all(predicates.map(predicate => predicate(entity)));
    return results.some(result => result !== false);
  }
}

export function every(...predicates: ((entity: any) => Awaitable<any>)[]): (entity: any) => Promise<boolean> {
  return async (entity: any) => {
    const results = await Promise.all(predicates.map(predicate => predicate(entity)));
    return results.every(result => result !== false);
  }
}

export function invert(predicate: (entity: any) => Awaitable<any>): (entity: any) => Promise<boolean> {
  return async (entity: any) => !await predicate(entity);
}


export default {
  permissions,
  ownerOnly,
  guildOnly,
  some,
  every,
  invert,
}