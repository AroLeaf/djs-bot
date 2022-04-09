import { ApplicationCommandData, ApplicationCommandSubCommandData, BaseCommandInteraction, BitField, Message, BitFieldResolvable } from 'discord.js';

export interface PrefixCommandData {
  name: string;
  description?: string;
}

export interface StandaloneSubcommandData extends ApplicationCommandSubCommandData {
  group?: string;
}

export type WithFlags<T> = T & { flags?: CommandFlagResolvable }

export type CommandData = WithFlags<ApplicationCommandData | StandaloneSubcommandData | PrefixCommandData>;


export class Command {
  name: string;
  description?: string;
  flags: CommandFlags;
  data: CommandData;

  constructor(data: CommandData) {
    this.data = data;
    this.name = data.name;
    this.description = 'description' in data ? data.description: undefined;
    this.flags = new CommandFlags(data.flags);
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
    return true;
  }
}


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