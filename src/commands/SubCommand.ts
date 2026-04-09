import { ApplicationCommandOptionType, type APIApplicationCommandSubcommandOption, type ApplicationCommandSubCommandData } from 'discord.js';
import { Command, type CommandOptions } from './Command';
import { SlashCommand, type SlashCommandHandler, type SlashCommandHandlerOptionsFromOptions } from './SlashCommand';
import type { SlashCommandContext } from './SlashCommandContext';
import { SlashCommandOption, type SlashCommandOptionOptions } from './SlashCommandOption';
import { SubCommandGroup } from './SubCommandGroup';

export interface SubCommandOptions extends CommandOptions {
  options?: SlashCommandOptionOptions[];
}

export class SubCommand<const T extends SubCommandOptions = SubCommandOptions, A extends {} = SlashCommandHandlerOptionsFromOptions<T>> extends Command {
  command: SlashCommand;
  group?: SubCommandGroup;
  options?: SlashCommandOption[];
  handler: SlashCommandHandler<A>;

  constructor(parent: SlashCommand | SubCommandGroup, options: T, handler: SlashCommandHandler<A>) {
    super(options);
    this.options = options.options?.map(option => new SlashCommandOption(this, option));
    this.handler = handler;

    this.command = parent instanceof SubCommandGroup ? parent.command : parent;
    this.group = parent instanceof SubCommandGroup ? parent : undefined;
  }

  static generateId(parent: SlashCommand | SubCommandGroup, name: string): string {
    return `${parent.id}.${name}`;
  }
  
  get id(): string {
    return SubCommand.generateId(this.group ?? this.command, this.name);
  }

  get APIData(): APIApplicationCommandSubcommandOption {
    return {
      type: ApplicationCommandOptionType.Subcommand,
      name: this.name,
      name_localizations: this.localization
        && Object.fromEntries(Object.entries(this.localization).map(([locale, localization]) => [locale, localization.name])),
      description: this.description,
      description_localizations: this.localization
        && Object.fromEntries(Object.entries(this.localization).map(([locale, localization]) => [locale, localization.name])),
      options: this.options?.map(option => option.APIData),
    }
  }

  async run(ctx: SlashCommandContext, options: A): Promise<any> {
    try {
      if (!await this.checkHooks(ctx)) return;
      await this.handler(ctx, options);
    } catch (err) {
      console.log(err);
    }
  }
}