import type { CommandInteraction, Message } from 'discord.js';
import { CommandContext } from '../CommandContext';
import type { InteractionCommand } from './InteractionCommand';

export abstract class InteractionCommandContext<E extends CommandInteraction> extends CommandContext<E> {
  declare command: InteractionCommand;
  
  constructor(command: InteractionCommand, entity: E) {
    super(command, entity);
    this.user = entity.user;
    this.guild = entity.guild;
    this.member = entity.inCachedGuild() ? entity.member : undefined;
  }
  
  isMessageBased(): this is CommandContext<Message> {
    return false;
  }

  isInteractionBased(): this is CommandContext<CommandInteraction> {
    return true;
  }
}