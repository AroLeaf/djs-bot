
import { ModalSubmitInteraction } from 'discord.js';
import { CommandData } from '../types.js';

import * as log from '../logging.js';
import { Command } from './command.js';

/**
 * A class for handling modal interactions.
 * @example
 * A simple modal handler that tells the user what they submitted.
 * ```js
 * new ModalHandler({
 *   name: 'testform',
 * }, async (interaction, fields) => {
 *   return interaction.reply(`You submitted the form with the following fields: ${Object.entries(fields).map(([key, value]) => `${key}: ${value}`).join('\n')}`);
 * });
 * ```
 */
export class ModalHandler extends Command {
  /** The function to run when receiving a matching modal. */
  run: (interaction: ModalSubmitInteraction, fields?: { [key: string]: string }) => any;

  /**
   * Creates a new ModalHandler.
   * @param data - the data for this command
   * @param run - the function to run when receiving a matching modal
   */
  constructor(data: CommandData, run: (interaction: ModalSubmitInteraction, fields?: { [key: string]: string }) => any) {
    super(data);
    this.run = run;
  }

  /**
   * Executes this modal handler, notifying the user if an error occurs.
   * @param interaction - the interaction to execute this modal handler on
   */
  async execute(interaction: ModalSubmitInteraction) {
    try {
      await this.run(interaction, Object.fromEntries(interaction.fields.fields.mapValues(component => component.value).entries()));
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