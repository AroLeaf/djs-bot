import { ApplicationCommandData, ApplicationCommandType, GuildMember, UserApplicationCommandData, UserContextMenuCommandInteraction } from 'discord.js';
import { Command, SlashCommand } from '.';
import { CommandOptions } from '../types';
import { UserCommandContext, UserCommandHandler, UserCommandOptions, UserWithMember } from '../types/userCommand';

export default class UserCommand extends Command {
  data: UserApplicationCommandData;
  guilds?: string[];
  handler: UserCommandHandler;
  
  constructor(options: UserCommandOptions, handler: UserCommandHandler) {
    super(options as CommandOptions);
    this.data = SlashCommand.cleanData(Object.assign(options, { type: ApplicationCommandType.User }) as ApplicationCommandData);
    this.guilds = options.guilds;
    this.handler = handler;
  }

  async run(interaction: UserContextMenuCommandInteraction) {
    const user: UserWithMember = interaction.targetUser;
    const member = interaction.targetMember || undefined;
    if (member instanceof GuildMember) user.member = member;
    const context: UserCommandContext = {
      command: this,
      interaction,
      user, member,
    }

    const ok = await this.before(context, user);
    if (!ok) return;

    try {
      await this.handler(context, user);
    } catch(error) {
      return this.error(context, user, error as Error);
    }

    await this.after(context, user);
  }
}