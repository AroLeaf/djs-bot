
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
import { SlashCommand, parseOptions } from './slashCommand.js';


/**
 * A class for handling subcommands.
 * @example
 * This example shows how to create a subcommand for a slash command.
 * ```js
 * const command = new SlashCommand({
 *   name: 'test',
 *   description: 'test command',
 * });
 * 
 * const subcommand = command.subcommand({
 *   name: 'subcommand',
 *   description: 'subcommand',
 * }, (interaction) => {
 *   interaction.reply('I am a subcommand');
 * });
 * ```
 */
export class Subcommand extends Command {
  /** The parent command of this subcommand. */
  command: SlashCommand;
  /** The data for this subcommand. */
  data: StandaloneSubcommandData;
  /** The group this subcommand belongs to, if any. */
  group?: string;
  /** The autocomplete handlers for this subcommand. */
  autocompleteHandlers = new Collection<string, autocompleteHandler>();
  /** The function to run when this subcommand is executed. */
  run: (interaction: ChatInputCommandInteraction, options?: any) => any;

  /**
   * Creates a new subcommand.
   * @param command - the parent command of this subcommand
   * @param data - the data for this subcommand
   * @param run - the function to run when this subcommand is executed
   */
  constructor(command: SlashCommand, data: BaseCommandData<StandaloneSubcommandData>, run: (interaction: ChatInputCommandInteraction, options?: any) => any) {
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

  /**
   * Executes this subcommand, notifiying the user if an error occurs.
   * @param interaction - the interaction to execute this subcommand for
   */
  async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
    try {
      if (!await this.check(interaction)) return;
      await this.run(interaction, parseOptions(interaction.options.data));
    } catch (err) {
      log.error(err);
      const res = {
        content: 'Something went wrong executing the command',
        ephemeral: true,
      };
      interaction.deferred ? interaction.editReply(res) : interaction.replied ? interaction.followUp(res) : interaction.reply(res);
    }
  }

  /**
   * Executes an autocomplete handler for this subcommand, replying with no options if an error occurs.
   * @param interaction - the autocomplete interaction to execute a handler for
   */
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