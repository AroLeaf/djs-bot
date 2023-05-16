import { ApplicationCommandOptionData, ApplicationCommandSubGroupData, ApplicationCommandSubCommandData, ChatInputCommandInteraction, ApplicationCommandOptionType } from 'discord.js';
import SubCommand from '../commands/subCommand';
import { CommandContext, CommandOptions } from './command';
import { AutocompleteHandler } from './slashCommand';

export type ApplicationSubCommandOptionData = Exclude<ApplicationCommandOptionData, ApplicationCommandSubGroupData | ApplicationCommandSubCommandData> & { onAutocomplete?: AutocompleteHandler };
export interface SubCommandOptions extends CommandOptions<SubCommandContext>, Omit<ApplicationCommandSubCommandData, 'type'> {
  type?: ApplicationCommandOptionType.Subcommand;
  options?: ApplicationSubCommandOptionData[];
  group?: string;
}

export type SubCommandHandler = (context: SubCommandContext, options: any) => any;

export interface SubCommandContext extends CommandContext {
  command: SubCommand;
  interaction: ChatInputCommandInteraction<'cached'>;
}