import { ApplicationCommandData, ApplicationCommandOptionType, ApplicationCommandSubCommandData, ApplicationCommandSubGroupData, AutocompleteInteraction, ChatInputApplicationCommandData, ChatInputCommandInteraction, Collection, CommandInteractionOption } from 'discord.js';
import { CommandOptions } from '../types';
import { AutoCompleteContext, AutocompleteHandler, SlashCommandContext, SlashCommandHandler, SlashCommandOptions, SubCommandGroupOptions, SubCommandOptionOptions } from '../types/slashCommand';
import { objectOmit } from '../util';
import Command from './command';
import SubCommand from './subCommand';

export default class SlashCommand extends Command {
  data: ChatInputApplicationCommandData;
  guilds?: string[];
  subcommands = new Collection<string, SubCommand>();
  autocompleteHandlers = new Collection<string, AutocompleteHandler>();
  handler: SlashCommandHandler;

  constructor(options: SlashCommandOptions, handler: SlashCommandHandler) {
    super(options as CommandOptions);
    this.guilds = options.guilds;
    [this.autocompleteHandlers, this.data] = SlashCommand.extractAutocompleteHandlers(options);
    this.handler = handler;
  }

  async run(interaction: ChatInputCommandInteraction<'cached'>) {
    const options = SlashCommand.parseOptions(interaction.options.data);
    const context: SlashCommandContext = {
      interaction,
      command: this,
    }

    const ok = await this.before(context, options);
    if (!ok) return;

    try {
      const subcommandName = interaction.options.getSubcommand(false);
      const subcommandGroup = interaction.options.getSubcommandGroup(false);
      const subcommand = subcommandName && this.subcommands.get(subcommandGroup ? `${subcommandGroup}.${subcommandName}` : subcommandName);
      if (subcommand) await subcommand.run(interaction);
      else await this.handler(context, options);
    } catch(error) {
      return this.error(context, options, error as Error);
    }

    await this.after(context, options);
  }

  async autocomplete(interaction: AutocompleteInteraction<'cached'>) {
    const subCommandName = interaction.options.getSubcommand(false);
    const subCommandGroup = interaction.options.getSubcommandGroup(false);
    const subCommandLabel = subCommandGroup ? `${subCommandGroup}.${subCommandName}` : subCommandName;
    if (subCommandLabel) {
      const subCommand = this.subcommands.get(subCommandLabel);
      return subCommand && subCommand.autocomplete(interaction);
    }
    const focusedOption = interaction.options.getFocused(true);
    const handlerLabel = subCommandLabel ? `${subCommandLabel}.${focusedOption.name}` : focusedOption.name;
    const autocompleteHandler = this.autocompleteHandlers.get(handlerLabel);
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


  static parseOptions(options: ReadonlyArray<CommandInteractionOption<'cached'>>): any {
    if (!options?.length) return {};
    if ([
      ApplicationCommandOptionType.SubcommandGroup,
      ApplicationCommandOptionType.Subcommand,
    ].includes(options[0].type)) return this.parseOptions(options[0].options!);
    return Object.fromEntries(options.map(option => {
      switch(option.type) {
        case ApplicationCommandOptionType.String:
        case ApplicationCommandOptionType.Number:
        case ApplicationCommandOptionType.Integer:
        case ApplicationCommandOptionType.Boolean:      return [option.name, option.value!];
        case ApplicationCommandOptionType.User:         return [option.name, Object.assign(option.user!, { member: option.member })];
        case ApplicationCommandOptionType.Channel:      return [option.name, option.channel!];
        case ApplicationCommandOptionType.Role:         return [option.name, option.role!];
        case ApplicationCommandOptionType.Mentionable:  return [option.name, option.role || Object.assign(option.user!, { member: option.member })];
        case ApplicationCommandOptionType.Attachment:   return [option.name, option.attachment!];
        default: throw new Error('Uknown interaction option type!');
      }
    }));
  }

  static cleanData<
    T extends ApplicationCommandData | ApplicationCommandSubCommandData | ApplicationCommandSubGroupData,
    R extends ApplicationCommandData | ApplicationCommandSubCommandData | ApplicationCommandSubGroupData
  >(options: T): R {
    return objectOmit(options as any, 'hooks', 'guilds') as R;
  }

  static extractAutocompleteHandlers<T = any>(options: SlashCommandOptions | SubCommandGroupOptions | SubCommandOptionOptions, prefix = ''): [Collection<string, AutocompleteHandler>, T] {
    let handlers = new Collection<string, AutocompleteHandler>();
    const data = SlashCommand.cleanData(options);
    if ('options' in options) {
      options.options = options.options?.map(option => {
        if ('onAutocomplete' in option && option.onAutocomplete) {
          option.autocomplete = true;
          handlers.set(prefix + option.name, option.onAutocomplete);
        }
        if ('options' in option) {
          const [subHandlers, subData] = this.extractAutocompleteHandlers(option, prefix + option.name + '.');
          handlers = handlers.concat(subHandlers);
          return subData;
        }
        return option;
      });
    }
    return [handlers, data as T];
  }
}