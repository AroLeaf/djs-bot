import { SubCommandHandler, SubCommandOptions } from '../types/subCommand';
import { CommandOptions } from '../types/command';
import Command from './command';
import SlashCommand from './slashCommand';
import { ApplicationCommandSubCommandData, AutocompleteInteraction, ChatInputCommandInteraction, Collection } from 'discord.js';
import { AutoCompleteContext, AutocompleteHandler } from '../types';

export default class SubCommand extends Command {
  parent: SlashCommand;
  group?: string;
  data: ApplicationCommandSubCommandData;
  autocompleteHandlers = new Collection<string, AutocompleteHandler>();
  handler: SubCommandHandler;

  constructor(parent: SlashCommand, options: SubCommandOptions, handler: SubCommandHandler) {
    super(options as CommandOptions);
    this.parent = parent;
    this.data = SlashCommand.cleanData(options);
    [this.autocompleteHandlers, this.data] = SlashCommand.extractAutocompleteHandlers(options);
    this.handler = handler;

    this.parent.subcommands.set(this.label, this);
  }

  get label() {
    return this.group ? `${this.group} ${this.name}` : this.name;
  }

  async run(interaction: ChatInputCommandInteraction<'cached'>) {
    const options = SlashCommand.parseOptions(interaction.options.data);
    const context = {
      command: this,
      interaction,
    }

    const ok = await this.before(context, options);
    if (!ok) return;

    try {
      await this.handler(context, options);
    } catch(error) {
      return this.error(context, options, error as Error);
    }

    await this.after(context, options);
  }

  async autocomplete(interaction: AutocompleteInteraction<'cached'>) {
    const focusedOption = interaction.options.getFocused(true);
    const autocompleteHandler = this.autocompleteHandlers.get(focusedOption.name);
    if (!autocompleteHandler) return;
    const context: AutoCompleteContext = {
      interaction,
      command: this,
    }
    try {
      await autocompleteHandler(context, focusedOption);
    } catch(error) {
      return this.error(context, { [focusedOption.name]: focusedOption }, error as Error);
    }
  }
}