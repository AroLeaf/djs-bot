
import {
  ApplicationCommandSubGroupData,
  AutocompleteInteraction,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  Collection,
} from 'discord.js';

import {
  autocompleteHandler,
  BaseCommandData,
  StandaloneSubcommandData,
  SubcommandOptionData,
} from '../types.js';

import * as log from '../logging.js';
import { objectOmit } from '../util.js';
import { Command } from './command.js';
import { SlashCommand } from './slashCommand.js';

export class Subcommand extends Command {
  command: SlashCommand;
  data: StandaloneSubcommandData;
  group?: string;
  autocompleteHandlers = new Collection<string, autocompleteHandler>();
  run: (interaction: ChatInputCommandInteraction) => any;

  constructor(command: SlashCommand, data: BaseCommandData<StandaloneSubcommandData>, run: (interaction: ChatInputCommandInteraction) => any) {
    super(data);
    data.type = 1;
    this.data = {
      ...data,
      options: <SubcommandOptionData[]>data.options?.map(o => objectOmit(o, 'onAutocomplete')),
    };

    this.command = command;
    this.group = 'group' in data ? data.group : undefined;
    this.run = run;

    let parent: ChatInputApplicationCommandData | ApplicationCommandSubGroupData | undefined = this.command.data
    parent.options ||= [];
    if (this.group) {
      parent = parent.options.find(op => op.type === 2) as ApplicationCommandSubGroupData | undefined;
      if (!parent) log.warn(`group ${this.group} not found on command ${this.command.name}`);
    }
    if (parent) {
      command.subcommands.set(this.label, this);
      parent.options ||= [];
      parent.options.push(this.data);
    }

    for (const option of data.options || []) {
      if (!option.autocomplete) continue;
      if (!option.onAutocomplete) {
        log.warn(`option '${option.name}' on command '${data.name}' has autocomplete enabled, but no autocomplete handler`);
        continue;
      }
      this.autocompleteHandlers.set(option.name, option.onAutocomplete);
    }
  }

  get label() {
    return this.group ? `${this.group}.${this.name}` : this.name;
  }


  async execute(interaction: ChatInputCommandInteraction<"cached">) {
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
    const callback = this.autocompleteHandlers.get(interaction.options.getFocused(true).name);
    try {
      if (!callback) throw new Error(`No autocomplete handler found for option ${interaction.options.getFocused(true).name} on command ${this.name}`);
      await callback(interaction);
    } catch (err) {
      log.error(err);
      interaction.responded || interaction.respond([]);
    }
  }
}