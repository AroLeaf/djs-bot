import { MessageApplicationCommandData, Message, MessageContextMenuCommandInteraction } from 'discord.js';
import { CommandContext, CommandOptions } from '.';
import MessageCommand from '../commands/messageCommand';

export interface MessageCommandOptions extends CommandOptions<MessageCommandContext>, Omit<MessageApplicationCommandData, 'type'> {
  guilds?: string[];
}

export type MessageCommandHandler = (context: MessageCommandContext, message: Message) => any;

export interface MessageCommandContext extends CommandContext {
  command: MessageCommand;
  interaction: MessageContextMenuCommandInteraction;
  message: Message;
}