import { ApplicationCommandSubCommandData, ApplicationCommandSubGroupData, AutocompleteFocusedOption, AutocompleteInteraction, ChatInputApplicationCommandData, ChatInputCommandInteraction } from 'discord.js';
import { SlashCommand } from '../commands';
import SubCommand from '../commands/subCommand';
import { CommandContext, CommandOptions } from './command';
import { ApplicationSubCommandOptionData } from './subCommand';

export interface SubCommandGroupOptions extends ApplicationCommandSubGroupData {
  options: SubCommandOptionOptions[];
}

export interface SubCommandOptionOptions extends ApplicationCommandSubCommandData {
  options?: ApplicationSubCommandOptionData[];
}

export interface SlashCommandOptions extends CommandOptions<SlashCommandContext>, ChatInputApplicationCommandData {
  options?: (SubCommandOptionOptions | SubCommandGroupOptions)[];
  guilds?: string[];
}

export type SlashCommandHandler = (context: SlashCommandContext, options: any) => any;
export type AutocompleteHandler = (context: AutoCompleteContext, option: AutocompleteFocusedOption) => any;

export interface SlashCommandContext extends CommandContext {
  command: SlashCommand;
  interaction: ChatInputCommandInteraction<'cached'>;
}

export interface AutoCompleteContext extends CommandContext {
  command: SlashCommand | SubCommand;
  interaction: AutocompleteInteraction<'cached'>;
}