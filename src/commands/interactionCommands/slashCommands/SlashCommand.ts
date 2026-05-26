import { ApplicationCommandOptionType, ApplicationCommandType, Attachment, ChatInputCommandInteraction, Collection, GuildMember, Role, User, type APIApplicationCommandOption, type ApplicationCommandData, type Channel, type CommandInteractionOption } from 'discord.js';
import { InteractionCommand, type InteractionCommandOptions } from '../InteractionCommand';
import { SlashCommandOption, type ApplicationCommandOptionResponseType, type SlashCommandOptionOptions } from './SlashCommandOption';
import { SlashCommandContext } from './SlashCommandContext';
import type { Filter } from '../../../internal/types';
import { SubCommand, type SubCommandOptions } from './SubCommand';
import { SubCommandGroup, type SubCommandGroupOptions } from './SubCommandGroup';

export interface SlashCommandOptions extends InteractionCommandOptions {
  options?: SlashCommandOptionOptions[];
}

export type SlashCommandHandlerOptions = Record<string, string | number | boolean | User & { member?: GuildMember } | Channel | Role | Attachment>;
export type SlashCommandHandler<T extends SlashCommandHandlerOptions> = (ctx: SlashCommandContext, options: T) => any;

// TODO: rename
export type SlashCommandHandlerOptionsFromOptions<T extends SlashCommandOptions> = { [K in T['options'][number]['name']]: ApplicationCommandOptionResponseType<Filter<T['options'][number], { name: K }>['type']> };

export class SlashCommand<const T extends SlashCommandOptions = SlashCommandOptions, A extends {} = SlashCommandHandlerOptionsFromOptions<T>> extends InteractionCommand {
  type: ApplicationCommandType.ChatInput = ApplicationCommandType.ChatInput;
  subCommands: Collection<string, SubCommand> = new Collection();
  subCommandGroups: Collection<string, SubCommandGroup> = new Collection();
  options?: SlashCommandOption[];
  handler?: SlashCommandHandler<A>;

  constructor(options: T, handler?: SlashCommandHandler<A>) {
    super(options);
    this.options = options.options?.map(option => new SlashCommandOption(this, option));
    this.handler = handler;
  }

  get APIData() {
    const options: APIApplicationCommandOption[] = this.options?.map(option => option.APIData) || [];
    
    if (!options.length) {
      options.push(...this.subCommandGroups.map(group => group.APIData));
      options.push(...this.subCommands.map(command => command.APIData));
    }

    return <ApplicationCommandData>{ ...super.APIData, options };
  }

  subCommand<const T extends SubCommandOptions = SubCommandOptions, A extends {} = SlashCommandHandlerOptionsFromOptions<T>>(options: T, handler: SlashCommandHandler<A>): SubCommand<T>;
  subCommand<const T extends SubCommandOptions = SubCommandOptions, A extends {} = SlashCommandHandlerOptionsFromOptions<T>>(command: SubCommand<T, A>): SubCommand<T>;
  subCommand<const T extends SubCommandOptions = SubCommandOptions, A extends {} = SlashCommandHandlerOptionsFromOptions<T>>(options: T | SubCommand<T, A>, handler?: SlashCommandHandler<A>): SubCommand<T, A> {
    const subCommand = options instanceof SubCommand ? options : new SubCommand(this, options, handler);
    this.subCommands.set(subCommand.id, subCommand);
    return subCommand;
  }

  subCommandGroup(options: SubCommandGroupOptions): SubCommandGroup;
  subCommandGroup(group: SubCommandGroup): SubCommandGroup;
  subCommandGroup(options: SubCommandGroupOptions | SubCommandGroup): SubCommandGroup {
    const group = options instanceof SubCommandGroup ? options : new SubCommandGroup(this, options);
    this.subCommandGroups.set(group.id, group);
    return group;
  }

  // TODO: run group hooks on subcommand run
  async run(interaction: ChatInputCommandInteraction<'cached'>): Promise<any> {
    const options = SlashCommand.parseOptions<A>(interaction.options.data);
    const ctx = new SlashCommandContext(this, interaction);
    
    const subCommandGroup = options.subCommandGroup && this.subCommandGroups.get(SubCommandGroup.generateId(this, options.subCommandGroup));
    const parent = subCommandGroup ?? this;
    const subCommand = options.subCommand && parent.subCommands.get(SubCommand.generateId(parent, options.subCommand));
    
    try {
      if (subCommandGroup && !await subCommandGroup.checkHooks(ctx)) return;
      if (subCommand) return subCommand.run(ctx, options.options);

      if (!await this.checkHooks(ctx)) return;
      await this.handler(ctx, options.options);
    } catch (err) {
      console.log(err);
    }
  }

  // TODO: split and move part to SlashCommandOption
  static parseOptions<T extends SlashCommandHandlerOptions>(options: readonly CommandInteractionOption<'cached'>[]): {
    subCommandGroup?: string,
    subCommand?: string,
    options: T,
  } {
    if (!options?.length) return { options: <T>{} };
    
    if (options[0].type === ApplicationCommandOptionType.SubcommandGroup) return {
      subCommandGroup: options[0].name,
      ...this.parseOptions(options[0].options!),
    }

    if (options[0].type === ApplicationCommandOptionType.Subcommand) return {
      subCommand: options[0].name,
      ...this.parseOptions(options[0].options!),
    }
    
    return {
      options: Object.fromEntries(options.map(option => {
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
      }))
    };
  }
}