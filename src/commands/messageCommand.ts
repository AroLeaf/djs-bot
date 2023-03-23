import { ApplicationCommandData, ApplicationCommandType, MessageApplicationCommandData, MessageContextMenuCommandInteraction } from 'discord.js';
import { Command, SlashCommand } from '.';
import { CommandOptions } from '../types';
import { MessageCommandContext, MessageCommandHandler, MessageCommandOptions } from '../types/messageCommand';

export default class MessageCommand extends Command {
  data: MessageApplicationCommandData;
  guilds?: string[];
  handler: MessageCommandHandler;
  
  constructor(options: MessageCommandOptions, handler: MessageCommandHandler) {
    super(options as CommandOptions);
    this.data = SlashCommand.cleanData(Object.assign(options, { type: ApplicationCommandType.Message }) as ApplicationCommandData);
    this.guilds = options.guilds;
    this.handler = handler;
  }

  async run(interaction: MessageContextMenuCommandInteraction) {
    const message = interaction.targetMessage;
    const context: MessageCommandContext = {
      command: this,
      interaction,
      message,
    }

    const ok = await this.before(context, message);
    if (!ok) return;

    try {
      await this.handler(context, message);
    } catch(error) {
      return this.error(context, message, error as Error);
    }

    await this.after(context, message);
  }
}