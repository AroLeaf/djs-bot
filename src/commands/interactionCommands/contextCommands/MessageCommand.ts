import { ApplicationCommandType, type Message, type MessageContextMenuCommandInteraction } from 'discord.js';
import { type InteractionCommandOptions } from '../InteractionCommand';
import { MessageCommandContext } from './MessageCommandContext';
import { ContextCommand } from './ContextCommand';

export interface MessageCommandOptions extends InteractionCommandOptions {};

export type MessageCommandHandler = (ctx: MessageCommandContext, message: Message) => any;

export class MessageCommand extends ContextCommand {
  type: ApplicationCommandType.Message = ApplicationCommandType.Message;
  handler: MessageCommandHandler;

  constructor(options: MessageCommandOptions, handler: MessageCommandHandler) {
    super(options);
    this.handler = handler;
  }

  async run(interaction: MessageContextMenuCommandInteraction<'cached'>): Promise<any> {
    const ctx = new MessageCommandContext(this, interaction);

    try {
      if (!await this.checkHooks(ctx)) return;
      await this.handler(ctx, interaction.targetMessage);
    } catch (err) {
      console.log(err);
    }
  }
}