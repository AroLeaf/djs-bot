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

export class ContextCommand extends Command {
  data: UserApplicationCommandData | MessageApplicationCommandData;
  guilds?: string[];
  run: (interaction: ContextMenuCommandInteraction, entity?: Message | User) => any;

  constructor(data: BaseCommandData<ContextCommandData>, run: (interaction: ContextMenuCommandInteraction, entity?: Message | User) => any) {
    super(data);
    this.data = objectOmit(data, 'guilds', 'flags');
    this.guilds = data.guilds;
    this.run = run;
  }

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
