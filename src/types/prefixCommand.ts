import { Message } from 'discord.js';
import { PrefixCommand } from '../commands';
import { CommandContext, CommandOptions } from './command';

export enum PrefixCommandArgumentType {
  String,
  Number,
  Integer,
  Boolean,
  User,
  Member,
  Userlike,
  Role,
  Channel,
  Message,
}

export type PrefixCommandArgumentTransformer = (value: any, context: { message: Message, argument?: PrefixCommandArgumentOptions, option?: PrefixCommandOptionOptions }) => any;

export interface PrefixCommandArgumentOptions {
  type: PrefixCommandArgumentType;
  name: string;
  description?: string;
  required?: boolean;
  transform?: PrefixCommandArgumentTransformer;
}

export interface PrefixCommandOptionOptions {
  name: string;
  short?: string;
  description?: string;
  required?: boolean;
  args?: PrefixCommandArgumentOptions[];
  transform?: PrefixCommandArgumentTransformer;
}

export interface PrefixCommandOptions extends CommandOptions<PrefixCommandContext> {
  description?: string;
  options?: PrefixCommandOptionOptions[];
  args?: PrefixCommandArgumentOptions[];
}

export type PrefixCommandHandler = (context: PrefixCommandContext, args: any) => any;

export interface PrefixCommandContext extends CommandContext {
  command: PrefixCommand,
  message: Message,
}