
import {
  ContextMenuCommandInteraction,
  MessageApplicationCommandData,
  UserApplicationCommandData,
} from 'discord.js';

import {
  BaseCommandData,
  ContextCommandData,
} from '../types.js';

import * as log from '../logging.js';
import { Command } from './command.js';
import { objectOmit } from '../util.js';

export class ContextCommand extends Command {
  data: UserApplicationCommandData | MessageApplicationCommandData;
  guilds?: string[];
  run: (interaction: ContextMenuCommandInteraction) => any;

  constructor(data: BaseCommandData<ContextCommandData>, run: (interaction: ContextMenuCommandInteraction) => any) {
    super(data);
    this.data = objectOmit(data, 'guilds', 'flags');
    this.guilds = data.guilds;
    this.run = run;
  }

  async execute(interaction: ContextMenuCommandInteraction<"cached">) {
    try {
      if (!await this.check(interaction)) return;
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