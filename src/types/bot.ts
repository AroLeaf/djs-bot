import { ChatInputCommandInteraction, ClientEvents, ClientOptions, Events, Message, MessageContextMenuCommandInteraction, ModalSubmitInteraction, UserContextMenuCommandInteraction } from 'discord.js';
import { Command, PrefixCommand, SlashCommand } from '../commands';
import CommandManager from '../commands/commandManager';
import MessageCommand from '../commands/messageCommand';
import ModalReceiver from '../commands/modal';
import UserCommand from '../commands/userCommand';
import ComponentsManager from '../componentsManager';
import Event from '../events/event';
import EventManager from '../events/eventManager';
import { EventKey } from './event';

declare module 'discord.js' {
  interface Client {
    owners: string[];
    prefix?: Prefix;
    hooks?: BotHookObject;
    commands: CommandManager;
    events: EventManager;
    components: ComponentsManager;
  }
}

export enum CustomBotHookKeys {
  PrefixCommand = 'prefixCommand',
  SlashCommand = 'slashCommand',
  MessageCommand = 'messageCommand',
  UserCommand = 'userCommand',
  ModalReceiver = 'modalReceiver',
}

export const BotHooks = Object.assign({}, Events, CustomBotHookKeys);
export type BotHookKey = keyof BotHookArguments;

export interface BotHookArguments extends ClientEvents {
  prefixCommand: [message: Message, command: PrefixCommand];
  slashCommand: [interaction: ChatInputCommandInteraction, command: SlashCommand];
  messageCommand: [interaction: MessageContextMenuCommandInteraction, command: MessageCommand];
  userCommand: [interaction: UserContextMenuCommandInteraction, command: UserCommand];
  modalReceiver: [interaction: ModalSubmitInteraction, modalReceiver: ModalReceiver];
}

export type BotHookObject = {
  [key in BotHookKey]?: ((...args: BotHookArguments[key]) => Promise<boolean | undefined>)[];
}

export interface CommandRegisterOptions {
  guilds?: string[];
  global?: boolean;
}

export interface BotOptions extends ClientOptions {
  prefix?: string | RegExp | FunctionPrefix;
  owners?: string[];
  owner?: string;
  defaultEvents?: boolean;
  commands?: Command[];
  events?: Event<EventKey>[];
  hooks?: BotHookObject;
  register?: CommandRegisterOptions;
}

export type FunctionPrefix = (message: Message) => string | Promise<string>;

export interface Prefix {
  get: FunctionPrefix;
  source: string | RegExp | FunctionPrefix;
}