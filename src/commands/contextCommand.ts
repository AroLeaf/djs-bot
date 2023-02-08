import {
  ApplicationCommandType,
  ContextMenuCommandInteraction,
  Message,
  MessageApplicationCommandData,
  User,
  UserApplicationCommandData,
} from 'discord.js';

import {
  BaseCommandData,
  ContextCommandData,
} from '../types.js';

import * as log from '../logging.js';
import { Command } from './command.js';
import { objectOmit } from '../util.js';


/**
 * A command that can be executed via a right click menu on a message or user.
 * @example
 * This command will reply with the ID of the user the command was executed on.
 * ```js
 * new ContextCommand({
 *   type: ApplicationCommandType.User,
 *   name: 'id',
 * }, (interaction, user) => {
 *   return interaction.reply(user.id);
 * });
 * ```
 */
export class ContextCommand extends Command {
  data: UserApplicationCommandData | MessageApplicationCommandData;
  /** The guilds this command should be limited to. */
  guilds?: string[];
  /** The function to run when this command is executed. */
  run: (interaction: ContextMenuCommandInteraction, entity?: Message | User) => any;

  /**
   * Creates a new ContextCommand.
   * @param data - the data for this command
   * @param run - the function to run when this command is executed
   */
  constructor(data: BaseCommandData<ContextCommandData>, run: (interaction: ContextMenuCommandInteraction, entity?: Message | User) => any) {
    super(data);
    this.data = objectOmit(data, 'guilds', 'flags');
    this.guilds = data.guilds;
    this.run = run;
  }

  /**
   * Executes this command, notifiying the user if an error occurs.
   * @param interaction 
   * @returns 
   */
  async execute(interaction: ContextMenuCommandInteraction<"cached">) {
    try {
      if (!await this.check(interaction)) return;
      const object = this.data.type === ApplicationCommandType.Message
        ? interaction.options.resolved?.messages?.first()
        : interaction.options.resolved?.users?.first();
      await this.run(interaction, object);
    } catch (err) {
      log.error(err);
      const res = {
        content: 'Something went wrong executing the command',
        ephemeral: true,
      };
      interaction.deferred ? interaction.editReply(res) : interaction.replied ? interaction.followUp(res) : interaction.reply(res);
    }
  }
}
