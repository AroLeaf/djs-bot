import {
  Message,
  PermissionsBitField,
  CommandInteraction,
  GuildMember,
} from 'discord.js';

import {
  CommandData,
  CommandFlagsBitField,
  CommandPermissions, 
} from '../types';



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
  }

  check(request: CommandInteraction<"cached"> | Message) {
    const user = request instanceof Message ? request.author:  request.user;
    function reject(reason: string) {
      const data = {
        content: reason,
        ephemeral: true,
        allowedMentions: { repliedUser: false, parse: [] },
      };
      request instanceof CommandInteraction<"cached"> && (request.replied || request.deferred)
        ? request.replied ? request.followUp(data) : request.editReply(data)
        : request.reply(data);
      return false;
    }
    
    if (this.flags.has(CommandFlagsBitField.Flags.GUILD_ONLY) && !request.inGuild()) return reject('This command can only be used in guilds.');
    if (this.flags.has(CommandFlagsBitField.Flags.OWNER_ONLY) && !request.client.owners?.includes(user.id)) return reject('This command can only be used by the bot owner(s)');

    if (request.inGuild()) {
      const permissions = (member?: GuildMember | null) => request.channel
        ? member?.permissionsIn(request.channel)
        : member?.permissions;

      if (this.perms.user.bitfield && !permissions(request.member)?.has(this.perms.user)) return reject(`You are missing permissions:\n${permissions(request.member)?.missing(this.perms.user).join('\n')}`);
      if (this.perms.self.bitfield && !permissions(request.guild.members.me)?.has(this.perms.self)) return reject(`I am missing permissions:\n${permissions(request.guild.members.me)?.missing(this.perms.self).join('\n')}`);
    }
    
    return true;
  }
}