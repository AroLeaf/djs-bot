import { MessageFlags, type InteractionReplyOptions, type InteractionResponse, type Message, type MessageContextMenuCommandInteraction } from 'discord.js';
import { ContextCommandContext } from './ContextCommandContext';
import type { MessageCommand } from './MessageCommand';

export class MessageCommandContext extends ContextCommandContext<MessageContextMenuCommandInteraction> {
  declare command: MessageCommand;
  
  constructor(command: MessageCommand, entity: MessageContextMenuCommandInteraction) {
    super(command, entity);
  }
  
  reply(content: string): Promise<InteractionResponse>;
  reply(options: InteractionReplyOptions): Promise<Message | InteractionResponse>;
  reply(options: string | InteractionReplyOptions): Promise<Message | InteractionResponse> {
    return this.entity.reply(typeof options === 'string' ? {
      content: options,
      flags: this.command.ephemeral ? [ MessageFlags.Ephemeral ] : [],
    } : options);
  }
}