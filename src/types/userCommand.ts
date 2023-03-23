import { UserContextMenuCommandInteraction, UserApplicationCommandData, User, GuildMember, APIGuildMember } from 'discord.js';
import { CommandContext, CommandOptions } from '.';
import UserCommand from '../commands/userCommand';

export interface UserCommandOptions extends CommandOptions<UserCommandContext>, Omit<UserApplicationCommandData, 'type'> {
  guilds?: string[];
}

export type UserWithMember = User & { member?: GuildMember };
export type UserCommandHandler = (context: UserCommandContext, user: UserWithMember) => any;

export interface UserCommandContext extends CommandContext {
  command: UserCommand;
  interaction: UserContextMenuCommandInteraction;
  user: User & { member?: GuildMember };
  member?: GuildMember | APIGuildMember;
}