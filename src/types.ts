import {
  ApplicationCommandData,
  ApplicationCommandOptionData,
  ApplicationCommandSubCommandData,
  ApplicationCommandSubGroupData,
  AutocompleteInteraction,
  BitField,
  BitFieldResolvable,
  ChatInputApplicationCommandData,
  ClientOptions,
  Collection,
  GuildBasedChannel,
  GuildMember,
  Message,
  MessageApplicationCommandData,
  PermissionResolvable,
  PermissionsBitField,
  Role,
  User,
  UserApplicationCommandData,
} from 'discord.js';

import type { Command, CommandManager } from './commands';
import type { EventManager, Event } from './events';



// CLIENT

declare module 'discord.js' {
  interface Client {
    commands?: CommandManager;
    events?: EventManager;
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

export interface PrefixCommandOptionData {
  type: PrefixCommandOptionType | PrefixCommandOptionTypeString;
  name: string;
  description?: string;
  strict?: boolean;
  required?: boolean;
}

export interface PrefixCommandData {
  name: string;
  description?: string;
  options?: PrefixCommandOptionData[];
}


export type ResolvedPrefixCommandOptionType = 
  | string
  | number
  | User
  | GuildMember
  | Role
  | GuildBasedChannel
  | Message

export type PrefixCommandArguments<Parsed = boolean> = Parsed extends true ? Collection<string, ResolvedPrefixCommandOptionType> & { raw: string[] } : string[];



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