import {
  AnySelectMenuInteraction,
  APIPartialEmoji,
  ApplicationCommandData,
  ApplicationCommandOptionData,
  ApplicationCommandSubCommandData,
  ApplicationCommandSubGroupData,
  AutocompleteInteraction,
  BitField,
  BitFieldResolvable,
  ButtonInteraction,
  ButtonStyle,
  ChatInputApplicationCommandData,
  ClientOptions,
  ComponentType,
  GuildBasedChannel,
  GuildMember,
  Message,
  MessageApplicationCommandData,
  PermissionResolvable,
  PermissionsBitField,
  Role,
  SelectMenuComponentOptionData,
  User,
  UserApplicationCommandData,
} from 'discord.js';

import type { Command, CommandManager } from './commands';
import type { ComponentsManager } from './componentsManager';
import type { EventManager, Event } from './events';



// BOT

declare module 'discord.js' {
  interface Client {
      /** The command manager for this bot. */
    commands: CommandManager;
    /** The event manager for this bot. */
    events: EventManager;
    /** The components manager for this bot. */
    components: ComponentsManager;
    /** The owner(s) of this bot. */
    owners: string[];
    /** The bot's prefix. */
    prefix?: string;
  }
}

export interface CommandRegisterOptions {
  /** Whether to register commands globally or not. */
  global?: boolean;
  /** Guilds to register commands in, if not registering globally. */
  guilds?: string[];
}

export interface BotOptions extends ClientOptions {
  /** Commands the bot should handle. */
  commands?: Command[];
  /** Events the bot should handle. */
  events?: Event[];
  /** Disabled default event handlers. */
  defaultEvents?: { [key: string]: boolean };
  /** The bot's owner, if one. */
  owner?: string;
  /** The bot's owners, if multiple. */
  owners?: string[];
  /** The bot's prefix. */
  prefix?: string;
  /** Options for registering application commands. */
  register?: CommandRegisterOptions;
}



// EVENTS

export interface EventOptions {
  /** The name of the event. */
  name?: string;
  /** The event to listen to. */
  event: string;
  /** Whether the event should be repeated. */
  repeat?: boolean;
}



// COMMANDS

export type CommandFlagString = 
  | 'OWNER_ONLY'
  | 'GUILD_ONLY'

export type CommandFlagResolvable = BitFieldResolvable<CommandFlagString, number>;

export class CommandFlagsBitField extends BitField<CommandFlagString, number> {
  static override Flags = {
    /** This command may only be used by the bot owner. */
    OWNER_ONLY: 1<<0,
    /** This command may only be used in a guild. */
    GUILD_ONLY: 1<<1,
  }
}

export interface CommandPermissionsResolvable {
  /** Permissions the bot needs to run this command. */
  self: PermissionResolvable;
  /** Permissions the user needs to run this command. */
  user: PermissionResolvable;
}

export interface CommandPermissions {
  /** Permissions the bot needs to run this command. */
  self: PermissionsBitField;
  /** Permissions the user needs to run this command. */
  user: PermissionsBitField;
}

/**
 * @typeParam T - The type of the command data.
 */
export type BaseCommandData<T> = T & {
  flags?: CommandFlagResolvable;
  permissions?: CommandPermissionsResolvable;
}

export type CommandData = BaseCommandData<ApplicationCommandData | StandaloneSubcommandData | PrefixCommandData>;



// PREFIX COMMANDS

export interface Prefix {
  /** Get the part of a message that is the prefix used in that message. */
  get(message: Message): string | undefined;
  /** Check if a message starts with the prefix. */
  test(message: Message): boolean;
  /** Whether or not mentioning the bot should count as a prefix. */
  mention: boolean;
}

export enum PrefixCommandOptionType {
  STRING,
  NUMBER,
  INTEGER,
  USER,
  MEMBER,
  USERLIKE,
  ROLE,
  CHANNEL,
  MESSAGE,
}

export type PrefixCommandOptionTypeString = 
  | 'STRING'
  | 'NUMBER'
  | 'INTEGER'
  | 'USER'
  | 'MEMBER'
  | 'USERLIKE'
  | 'ROLE'
  | 'CHANNEL'
  | 'MESSAGE'

export interface PrefixCommandArgumentData {
  /** The datatype the argument should resolve to. */
  type: PrefixCommandOptionType | PrefixCommandOptionTypeString;
  /** The name of the argument. */
  name: string;
  /** The description of the argument. */
  description?: string;
  /** Whether the argument is required or not. */
  required?: boolean;
}

export interface PrefixCommandOptionData {
  /** The name of the option. */
  name: string;
  /** The short name of the option. (Should be a single letter.) */
  short?: string;
  /** The description of the option. */
  description?: string;
  /** Whether the argument is required or not. */
  required?: boolean;
  /** The arguments for this option. */
  args?: PrefixCommandArgumentData[];
}

export interface PrefixCommandData {
  /** The name of the command. */
  name: string;
  /** The description of the command. */
  description?: string;
  /** The aliases of the command. */
  aliases?: string[];
  /** The named options for this command. */
  options?: PrefixCommandOptionData[];
  /** The positional arguments for this command. */
  args?: PrefixCommandArgumentData[];
}


export type ResolvedPrefixCommandOptionType = 
  | string
  | number
  | User
  | GuildMember
  | Role
  | GuildBasedChannel
  | Message

export type PrefixCommandArguments<T> = ArgumentParserResults<T> | string[];



// APPLICATION COMMANDS

export type ContextCommandData = (UserApplicationCommandData | MessageApplicationCommandData) & {
  guilds?: string[]
}

export type autocompleteHandler = (interaction: AutocompleteInteraction<'cached'>) => any;

export type SlashCommandOptionData = ApplicationCommandOptionData & {
  /** The autocomplete handler function for this option. */
  onAutocomplete?: autocompleteHandler;
}

export interface SlashCommandData extends ChatInputApplicationCommandData {
  /** The guilds to register commands in, if not registering globally. */
  guilds: string[];
  /** The options for this command. */
  options?: SlashCommandOptionData[];
}

export type SubcommandOptionData = Exclude<ApplicationCommandOptionData, ApplicationCommandSubGroupData | ApplicationCommandSubCommandData> & {
  /** The autocomplete handler function for this option. */
  onAutocomplete?: autocompleteHandler;
}

export interface StandaloneSubcommandData extends ApplicationCommandSubCommandData {
  /** The group this subcommand belongs to, if any. */
  group?: string;
  /** The options for this subcommand. */
  options?: SubcommandOptionData[];
}



// ARGUMENT PARSER

export interface ArgumentParserArgumentData {
  /** The name of the argument. */
  name: string
  /** Whether the argument is required or not. */
  required?: boolean
}

export interface ArgumentParserOptionData {
  /** The name of the option. */
  name: string
  /** The short name of the option. (should be a single letter.) */
  short?: string
  /** The arguments for this option. */
  args?: ArgumentParserArgumentData[]
  /** Whether the option is required or not. */
  required?: boolean
}

/**
 * @typeParam T - The resolved type of arguments.
 */
export interface ArgumentParserOptions<T = any> {
  /** The positional arguments this parser should recognize. */
  args?: ArgumentParserArgumentData[]
  /** The named options this parser should recognize. */
  options?: ArgumentParserOptionData[]
  /** The function to use to transform the arguments to the correct data types. */
  transformer?: (arg: string, name: string, option?: string) => Promise<T>
}

/**
 * @typeParam T - The resolved type of arguments.
 */
export interface ArgumentParserResultArguments<T> {
  [key: string]: T
}

/**
 * @typeParam T - The resolved type of arguments.
 */
export interface ArgumentParserResults<T> {
  /** The positional arguments found. */
  args: ArgumentParserResultArguments<T>
  /** The named options found. */
  options: {
    [key: string]: ArgumentParserResultArguments<T> | T | boolean
  }
  /** All arguments after the first loose `--`. */
  rest?: string
}



// COMPONENTS

export type ComponentHandler = (interaction: ButtonInteraction<'cached'> | AnySelectMenuInteraction<'cached'>) => any;

export interface BaseComponentData {
  /** The type of component. */
  type: ComponentType,
}

/**
 * @typeParam Managed - Whether the component is managed or not.
 */
export interface ButtonComponentData<Managed extends boolean = false> extends BaseComponentData {
  type: ComponentType.Button,
  /** The custom_id of the button, if not managed. */
  customId: Managed extends true ? never : string,
  /** The text to display on the button. */
  label?: string,
  /** The style of the button. */
  style: ButtonStyle,
  /** The emoji to display on the button. */
  emoji?: APIPartialEmoji,
  /** The url to open when the button is clicked. */
  url?: string,
  /** Whether the button is disabled or not. */
  disabled?: boolean,
  /** The function to run when the button is clicked, if managed. */
  run: Managed extends true ? ComponentHandler : never,
}

/**
 * @typeParam Managed - Whether the component is managed or not.
 */
export interface SelectMenuComponentData<Managed extends boolean = false> extends BaseComponentData {
  type: ComponentType.StringSelect | ComponentType.ChannelSelect | ComponentType.RoleSelect | ComponentType.UserSelect | ComponentType.MentionableSelect,
  /** The custom_id of the select menu, if not managed. */
  customId: Managed extends true ? never : string,
  /** The text to display on the select menu if no options are selected. */
  placeholder?: string,
  /** The minimum number of options that can be selected. */
  minValues?: number,
  /** The maximum number of options that can be selected. */
  maxValues?: number,
  /** The options to display in the select menu. */
  options: SelectMenuComponentOptionData[],
  /** Whether the select menu is disabled or not. */
  disabled?: boolean,
  /** The function to run when the select menu is clicked, if managed. */
  run: Managed extends true ? ComponentHandler : never,
}

/**
 * @typeParam Managed - Whether the component is managed or not.
 */
export interface ActionRowData<Managed extends boolean = false> extends BaseComponentData {
  type: ComponentType.ActionRow,
  /** The components to display in this action row. */
  components: (ButtonComponentData<Managed> | SelectMenuComponentData<Managed>)[],
}

/**
 * {@link ButtonComponentData}<Managed> | SelectMenuComponentData<Managed>
 * @typeParam Managed - Whether the component is managed or not.
 */
export type ActionRowComponentData<Managed extends boolean = false> = ButtonComponentData<Managed> | SelectMenuComponentData<Managed>;
/**
 * {@link ActionRowData}<Managed> | {@link ActionRowComponentData}<Managed>
 * @typeParam Managed - Whether the component is managed or not.
 */
export type ComponentData<Managed extends boolean = false> = ActionRowData<Managed> | ActionRowComponentData<Managed>;

/** {@link ActionRowData}<true> | {@link ActionRowComponentData}<true> */
export type ManagedComponentOptions = ActionRowData<true> | ActionRowComponentData<true>



// MISC

export enum LogType {
  INFO,
  WARN,
  ERROR, 
}

export type LogOptions = {
  /** Whether to send a fancy log message, or JSON data. */
  fancy?: boolean,
  /** The minimum log level to send. */
  level?: number,
};