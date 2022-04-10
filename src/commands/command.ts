import { ApplicationCommandData, BaseCommandInteraction, BitField, Message, BitFieldResolvable, PermissionResolvable, Permissions } from 'discord.js';

import type { StandaloneSubcommandData } from './appCommand.js';
import type { PrefixCommandData } from './prefixCommand.js';


export type CommandFlagString = 
| 'OWNER_ONLY'
| 'GUILD_ONLY'

export type CommandFlagResolvable = BitFieldResolvable<CommandFlagString, number>;

export class CommandFlags extends BitField<CommandFlagString, number> {
  static override FLAGS = {
    OWNER_ONLY: 1<<0,
    GUILD_ONLY: 1<<1,
  }
}

export interface CommandPermissionsResolvable {
  self: PermissionResolvable;
  user: PermissionResolvable;
}

interface CommandPermissions {
  self: Permissions;
  user: Permissions;
}

export type BaseCommandData<T> = T & {
  flags?: CommandFlagResolvable;
  permissions?: CommandPermissionsResolvable;
}

export type CommandData = BaseCommandData<ApplicationCommandData | StandaloneSubcommandData | PrefixCommandData>;


export class Command {
  name: string;
  description?: string;
  flags: CommandFlags;
  data: CommandData;
  perms: CommandPermissions;

  constructor(data: CommandData) {
    this.data = data;
    this.name = data.name;
    this.description = 'description' in data ? data.description: undefined;
    this.flags = new CommandFlags(data.flags);
    this.perms = {
      self: new Permissions(data.permissions?.self),
      user: new Permissions(data.permissions?.user),
    };
    delete data.flags;
  }

  check(request: BaseCommandInteraction<'cached'> | Message) {
    const user = request instanceof Message ? request.author:  request.user;
    const reply = (content: string) => request.reply({
      content, ephemeral: true,
      allowedMentions: { repliedUser: false },
    });
    
    if (this.flags?.has(CommandFlags.FLAGS.GUILD_ONLY) && !request.inGuild()) return reply('This command can only be used in guilds.');
    if (this.flags?.has(CommandFlags.FLAGS.OWNER_ONLY) && !request.client.owners?.includes(user.id)) return reply('This command can only be used by the bot owner(s)');
    
    if (request.inGuild()) {
      if (!request.member?.permissionsIn(request.channel).has(this.perms.user)) return reply('You are missing permissions:\n' + request.member?.permissionsIn(request.channel).missing(this.perms.user).join('\n'));
      if (!request.guild.me?.permissionsIn(request.channel).has(this.perms.self)) return reply('I am missing permissions:\n' + request.guild.me?.permissionsIn(request.channel).missing(this.perms.self).join('\n'));
    }
    
    return true;
  }
}