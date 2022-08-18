import {
  ApplicationCommandData,
  BitField,
  Message,
  BitFieldResolvable,
  PermissionResolvable,
  PermissionsBitField,
  CommandInteraction,
  GuildMember,
} from 'discord.js';

import type { StandaloneSubcommandData } from './appCommand.js';
import type { PrefixCommandData } from './prefixCommand.js';


export type CommandFlagString = 
  | 'OWNER_ONLY'
  | 'GUILD_ONLY'

export type CommandFlagResolvable = BitFieldResolvable<CommandFlagString, number>;

export class CommandFlagsBitField extends BitField<CommandFlagString, number> {
  static override Flags = {
    OWNER_ONLY: 1<<0,
    GUILD_ONLY: 1<<1,
  }
}

export interface CommandPermissionsResolvable {
  self: PermissionResolvable;
  user: PermissionResolvable;
}

interface CommandPermissions {
  self: PermissionsBitField;
  user: PermissionsBitField;
}

export type BaseCommandData<T> = T & {
  flags?: CommandFlagResolvable;
  permissions?: CommandPermissionsResolvable;
}

export type CommandData = BaseCommandData<ApplicationCommandData | StandaloneSubcommandData | PrefixCommandData>;


export class Command {
  name: string;
  description?: string;
  flags: CommandFlagsBitField;
  data: CommandData;
  perms: CommandPermissions;

  constructor(data: CommandData) {
    this.data = data;
    this.name = data.name;
    this.description = 'description' in data ? data.description: undefined;
    this.flags = new CommandFlagsBitField(data.flags);
    this.perms = {
      self: new PermissionsBitField(data.permissions?.self),
      user: new PermissionsBitField(data.permissions?.user),
    };
    delete data.flags;
  }

  check(request: CommandInteraction<'cached'> | Message) {
    const user = request instanceof Message ? request.author:  request.user;
    const reply = (content: string) => request.reply({
      content, ephemeral: true,
      allowedMentions: { repliedUser: false },
    });
    
    if (this.flags.has(CommandFlagsBitField.Flags.GUILD_ONLY) && !request.inGuild()) return reply('This command can only be used in guilds.');
    if (this.flags.has(CommandFlagsBitField.Flags.OWNER_ONLY) && !request.client.owners?.includes(user.id)) return reply('This command can only be used by the bot owner(s)');

    if (request.inGuild()) {
      const permissions = (member?: GuildMember | null) => request.channel
        ? member?.permissionsIn(request.channel)
        : member?.permissions;

      if (!permissions(request.member)?.has(this.perms.user)) return reply(`You are missing permissions:\n${permissions(request.member)!.missing(this.perms.user).join('\n')}`);
      if (!permissions(request.guild.members.me)?.has(this.perms.self)) return reply(`I am missing permissions:\n${permissions(request.guild.members.me)!.missing(this.perms.self).join('\n')}`);
    }
    
    return true;
  }
}