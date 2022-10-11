
import { ModalSubmitInteraction } from 'discord.js';
import { CommandData } from '../types.js';

import * as log from '../logging.js';
import { Command } from './command.js';

export class ModalHandler extends Command {
  run: (interaction: ModalSubmitInteraction) => any;

  constructor(data: CommandData, run: (interaction: ModalSubmitInteraction) => any) {
    super(data);
    this.run = run;
  }

  async execute(interaction: ModalSubmitInteraction) {
    try {
      await this.run(interaction);
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