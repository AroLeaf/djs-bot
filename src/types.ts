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
    commands?: CommandManager;
    events?: EventManager;
    components?: ComponentsManager;
    owners?: string[];
    prefix?: string;
  }
}

export interface CommandRegisterOptions {
  global?: boolean;
  guilds?: string[];
}

export interface BotOptions extends ClientOptions {
  commands?: Command[];
  events?: Event[];
  defaultEvents?: { [key: string]: boolean };
  owner?: string;
  owners?: string[];
  prefix?: string;
  register?: CommandRegisterOptions;
}



// EVENTS

export interface EventOptions {
  name?: string;
  event: string;
  repeat?: boolean;
  _default?: boolean | number;
}



// COMMANDS

export type CommandFlagString = 
  | 'OWNER_ONLY'
  | 'GUILD_ONLY'

export type CommandFlagResolvable = BitFieldResolvable<CommandFlagString, number>;

export class CommandFlagsBitField extends BitField<CommandFlagString, number> {
  static override Flags = {
    OWNER_ONLY: 1<<0,
    GUILD_ONLY: 1<<1,
  }
}

export interface CommandPermissionsResolvable {
  self: PermissionResolvable;
  user: PermissionResolvable;
}

export interface CommandPermissions {
  self: PermissionsBitField;
  user: PermissionsBitField;
}

export type BaseCommandData<T> = T & {
  flags?: CommandFlagResolvable;
  permissions?: CommandPermissionsResolvable;
}

export type CommandData = BaseCommandData<ApplicationCommandData | StandaloneSubcommandData | PrefixCommandData>;



// PREFIX COMMANDS

export interface Prefix {
  get(message: Message): string | undefined;
  test(message: Message): boolean;
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
  type: PrefixCommandOptionType | PrefixCommandOptionTypeString;
  name: string;
  description?: string;
  required?: boolean;
}

export interface PrefixCommandOptionData {
  name: string;
  short?: string;
  description?: string;
  required?: boolean;
  args?: PrefixCommandArgumentData[];
}

export interface PrefixCommandData {
  name: string;
  description?: string;
  aliases?: string[];
  options?: PrefixCommandOptionData[];
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
  onAutocomplete?: autocompleteHandler;
}

export interface SlashCommandData extends ChatInputApplicationCommandData {
  guilds: string[];
  options?: SlashCommandOptionData[];
}

export type SubcommandOptionData = Exclude<ApplicationCommandOptionData, ApplicationCommandSubGroupData | ApplicationCommandSubCommandData> & {
  onAutocomplete?: autocompleteHandler;
}

export interface StandaloneSubcommandData extends ApplicationCommandSubCommandData {
  group?: string;
  options?: SubcommandOptionData[];
}



// ARGUMENT PARSER

export interface ArgumentParserArgumentData {
  name: string
  required?: boolean
}

export interface ArgumentParserOptionData {
  name: string
  short?: string
  args?: ArgumentParserArgumentData[]
  required?: boolean
}

export interface ArgumentParserOptions<T = any> {
  args?: ArgumentParserArgumentData[]
  options?: ArgumentParserOptionData[]
  transformer?: (arg: string, name: string, option?: string) => Promise<T>
}

export interface ArgumentParserResultArguments<T> {
  [key: string]: T
}

export interface ArgumentParserResults<T> {
  args: ArgumentParserResultArguments<T>
  options: {
    [key: string]: ArgumentParserResultArguments<T> | T | boolean
  }
  rest?: string
}



// COMPONENTS

export type ComponentHandler = (interaction: ButtonInteraction<'cached'> | AnySelectMenuInteraction<'cached'>) => any;

export interface BaseComponentData {
  type: ComponentType,
}

export interface ButtonComponentData<Managed extends boolean = false> extends BaseComponentData {
  type: ComponentType.Button,
  customId: Managed extends true ? never : string,
  label?: string,
  style: ButtonStyle,
  emoji?: APIPartialEmoji,
  url?: string,
  disabled?: boolean,
  run: Managed extends true ? ComponentHandler : never,
}

export interface SelectMenuComponentData<Managed extends boolean = false> extends BaseComponentData {
  type: ComponentType.StringSelect | ComponentType.ChannelSelect | ComponentType.RoleSelect | ComponentType.UserSelect | ComponentType.MentionableSelect,
  customId: Managed extends true ? never : string,
  placeholder?: string,
  minValues?: number,
  maxValues?: number,
  options: SelectMenuComponentOptionData[],
  disabled?: boolean,
  run: Managed extends true ? ComponentHandler : never,
}

export interface ActionRowData<Managed extends boolean = false> extends BaseComponentData {
  type: ComponentType.ActionRow,
  components: (ButtonComponentData<Managed> | SelectMenuComponentData<Managed>)[],
}

export type ActionRowComponentData<Managed extends boolean = false> = ButtonComponentData<Managed> | SelectMenuComponentData<Managed>;
export type ComponentData<Managed extends boolean = false> = ActionRowData<Managed> | ActionRowComponentData<Managed>;

export type ManagedComponentOptions = ActionRowData<true> | ActionRowComponentData<true>



// MISC

export enum LogType {
  INFO,
  WARN,
  ERROR, 
}

export type LogOptions = {
  fancy?: boolean, 
  level?: number,
};