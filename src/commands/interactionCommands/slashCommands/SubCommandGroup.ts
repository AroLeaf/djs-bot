import { ApplicationCommandOptionType, Collection, type APIApplicationCommandSubcommandGroupOption } from 'discord.js';
import { Command, type CommandOptions } from '../../Command';
import type { SlashCommand, SlashCommandHandler, SlashCommandHandlerOptionsFromOptions } from './SlashCommand';
import type { SlashCommandOptionOptions } from './SlashCommandOption';
import { SubCommand, type SubCommandOptions } from './SubCommand';

export interface SubCommandGroupOptions extends CommandOptions {
  options?: SlashCommandOptionOptions[];
}

export class SubCommandGroup extends Command {
  command: SlashCommand;
  subCommands: Collection<string, SubCommand> = new Collection();

  constructor(parent: SlashCommand, options: SubCommandGroupOptions) {
    super(options);
    this.command = parent;
  }

  static generateId(parent: SlashCommand, name: string): string {
    return `${parent.id}.${name}`;
  }

  get id(): string {
    return SubCommandGroup.generateId(this.command, this.name);
  }

  get APIData(): APIApplicationCommandSubcommandGroupOption {
    return {
      type: ApplicationCommandOptionType.SubcommandGroup,
      name: this.name,
      name_localizations: this.localization
        && Object.fromEntries(Object.entries(this.localization).map(([locale, localization]) => [locale, localization.name])),
      description: this.description,
      description_localizations: this.localization
        && Object.fromEntries(Object.entries(this.localization).map(([locale, localization]) => [locale, localization.name])),
      options: this.subCommands?.map(option => option.APIData),
    }
  }

  subCommand<const T extends SubCommandOptions = SubCommandOptions, A extends {} = SlashCommandHandlerOptionsFromOptions<T>>(options: T, handler: SlashCommandHandler<A>): SubCommand<T>;
  subCommand<const T extends SubCommandOptions = SubCommandOptions, A extends {} = SlashCommandHandlerOptionsFromOptions<T>>(command: SubCommand<T, A>): SubCommand<T>;
  subCommand<const T extends SubCommandOptions = SubCommandOptions, A extends {} = SlashCommandHandlerOptionsFromOptions<T>>(options: T | SubCommand<T, A>, handler?: SlashCommandHandler<A>): SubCommand<T, A> {
    const subCommand = options instanceof SubCommand ? options : new SubCommand(this, options, handler);
    this.subCommands.set(subCommand.id, subCommand);
    return subCommand;
  }
}