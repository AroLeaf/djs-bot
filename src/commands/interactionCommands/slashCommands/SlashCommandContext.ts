import { ChatInputCommandInteraction, MessageFlags, type InteractionReplyOptions, type InteractionResponse, type Message } from 'discord.js';
import { InteractionCommandContext } from '../InteractionCommandContext';
import type { SlashCommand } from './SlashCommand';

export class SlashCommandContext extends InteractionCommandContext<ChatInputCommandInteraction> {
  declare command: SlashCommand;

  constructor(command: SlashCommand, entity: ChatInputCommandInteraction) {
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