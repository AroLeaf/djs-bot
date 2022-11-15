
import { ModalSubmitInteraction } from 'discord.js';
import { CommandData } from '../types.js';

import * as log from '../logging.js';
import { Command } from './command.js';

export class ModalHandler extends Command {
  run: (interaction: ModalSubmitInteraction, fields?: { [key: string]: string }) => any;

  constructor(data: CommandData, run: (interaction: ModalSubmitInteraction, fields?: { [key: string]: string }) => any) {
    super(data);
    this.run = run;
  }

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