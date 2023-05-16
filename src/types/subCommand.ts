import { ApplicationCommandOptionData, ApplicationCommandSubGroupData, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import SubCommand from '../commands/subCommand';
import { CommandContext, CommandOptions } from './command';
import { AutocompleteHandler } from './slashCommand';

export type ApplicationSubCommandOptionData = Exclude<ApplicationCommandOptionData, ApplicationCommandSubGroupData | ApplicationCommandSubCommandData> & { onAutocomplete?: AutocompleteHandler };
export interface SubCommandOptions extends CommandOptions<SubCommandContext>, ApplicationCommandSubCommandData {
  options?: ApplicationSubCommandOptionData[];
  group?: string;
}

export type SubCommandHandler = (context: SubCommandContext, options: any) => any;

export interface SubCommandContext extends CommandContext {
  command: SubCommand;
  interaction: ChatInputCommandInteraction<'cached'>;
}