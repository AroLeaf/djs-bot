
import {
  ApplicationCommandOptionData,
  AutocompleteInteraction,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  Collection,
} from 'discord.js';

import {
  autocompleteHandler,
  BaseCommandData,
  SlashCommandData,
  StandaloneSubcommandData,
} from '../types.js';

import * as log from '../logging.js';
import { Command } from './command.js';
import { Subcommand } from './subCommand.js';
import { objectOmit } from '../util.js';

export class SlashCommand extends Command {
  data: ChatInputApplicationCommandData;
  guilds: string[];
  subcommands = new Collection<string, Subcommand>();
  autocompleteHandlers = new Collection<string, autocompleteHandler>();
  run: (interaction: ChatInputCommandInteraction) => any;

  constructor(data: BaseCommandData<SlashCommandData>, run: (interaction: ChatInputCommandInteraction) => any) {
    super(data);
    data.type ||= 1;
    this.data = objectOmit(data, 'guilds', 'flags');
    this.data.options = <ApplicationCommandOptionData[]>data.options?.map(o => objectOmit(o, 'onAutocomplete'));
    this.guilds = data.guilds;
    this.run = run;

    for (const option of data.options || []) {
      if (!option.autocomplete) continue;
      if (!option.onAutocomplete) {
        log.warn(`option '${option.name}' on command '${data.name}' has autocomplete enabled, but no autocomplete handler`);
        continue;
      }
      this.autocompleteHandlers.set(option.name, option.onAutocomplete);
    }
  }


  subcommand(data: BaseCommandData<StandaloneSubcommandData>, run: (interaction: ChatInputCommandInteraction) => any) {
    return new Subcommand(this, data, run);
  }


  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const sub = interaction.options.getSubcommand(false);
    if (sub) {
      const group = interaction.options.getSubcommandGroup(false);
      const label = group ? `${group}.${sub}` : sub;
      const cmd = this.subcommands.get(label);
      if (cmd) return cmd.execute(interaction);
    }

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

  async autocomplete(interaction: AutocompleteInteraction<'cached'>) {
    const sub = interaction.options.getSubcommand(false);
    if (sub) {
      const group = interaction.options.getSubcommandGroup(false);
      const label = group ? `${group}.${sub}` : sub;
      const cmd = this.subcommands.get(label);
      if (cmd) return cmd.autocomplete(interaction);
    }

    const callback = this.autocompleteHandlers.get(interaction.options.getFocused(true).name);
    try {
      if (!callback) throw new Error(`No autocomplete handler found for option ${interaction.options.getFocused(true).name}`);
      await callback(interaction);
    } catch (err) {
      log.error(err);
      interaction.responded || interaction.respond([]);
    }
  }
}