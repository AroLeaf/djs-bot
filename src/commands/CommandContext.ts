import type { BaseMessageOptions, Client, CommandInteraction, DMChannel, Guild, GuildMember, GuildTextBasedChannel, Message, User } from 'discord.js';
import type { Command } from './Command';
import { Bound } from '../internal';

export type CommandEntity = Message | CommandInteraction;

export abstract class CommandContext<
  E extends CommandEntity = CommandEntity,
  InGuild extends boolean = boolean
> extends Bound {
  command: Command;
  entity: E;
  client: Client;

  user: User;
  member: InGuild extends true ? GuildMember : never;
  guild: InGuild extends true ? Guild : never;
  channel: InGuild extends true ? GuildTextBasedChannel : DMChannel;

  constructor(command: Command, entity: E) {
    super();
    this.command = command;
    this.entity = entity;
    this.client = entity.client;
    this.channel = <typeof this.channel>entity.channel;
  }

  abstract reply(content: string): any;
  abstract reply(options: BaseMessageOptions): any;
  abstract reply(options: string | BaseMessageOptions): any;

  abstract isMessageBased(): this is CommandContext<Message, InGuild>;
  abstract isInteractionBased(): this is CommandContext<CommandInteraction, InGuild>;

  inGuild(): this is CommandContext<E, true> {
    return this.entity.inGuild();
  }
}