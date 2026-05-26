import { ApplicationCommandType, ContextMenuCommandInteraction, type ApplicationCommandData, type MessageApplicationCommandData, type UserApplicationCommandData } from 'discord.js';
import { InteractionCommand } from '../InteractionCommand';

export abstract class ContextCommand extends InteractionCommand {
  type: ApplicationCommandType.Message | ApplicationCommandType.User;

  abstract run(interaction: ContextMenuCommandInteraction): any;

  get APIData(): (MessageApplicationCommandData | UserApplicationCommandData) & { description: undefined } {
    return {
      ...super.APIData,
      type: this.type,
      description: undefined,
    }
  }
}