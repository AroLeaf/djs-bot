import { MessageFlags, UserContextMenuCommandInteraction, type InteractionReplyOptions, type InteractionResponse, type Message } from 'discord.js';
import { ContextCommandContext } from './ContextCommandContext';
import type { UserCommand } from './UserCommand';

export class UserCommandContext extends ContextCommandContext<UserContextMenuCommandInteraction> {
  declare command: UserCommand;
  
  constructor(command: UserCommand, entity: UserContextMenuCommandInteraction) {
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