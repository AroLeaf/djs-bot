import { ApplicationCommandOptionType, Attachment, GuildMember, Role, User, type APIApplicationCommandBasicOption, type ChannelType, type GuildBasedChannel, type Locale } from 'discord.js';
import type { SlashCommand } from './SlashCommand';
import type { Localized } from '../../../internal/Localized';
import type { SubCommand } from './SubCommand';


type NumericApplicationOptionType =
  | ApplicationCommandOptionType.Integer
  | ApplicationCommandOptionType.Number
;

type PrimitiveApplicationOptionType =
  | NumericApplicationOptionType
  | ApplicationCommandOptionType.String
;

type ValueApplicationOptionType = Exclude<ApplicationCommandOptionType, ApplicationCommandOptionType.Subcommand | ApplicationCommandOptionType.SubcommandGroup>

export type ApplicationCommandOptionResponseType<T extends ApplicationCommandOptionType>
  = T extends ApplicationCommandOptionType.Attachment ? Attachment
  : T extends ApplicationCommandOptionType.Boolean ? boolean
  : T extends ApplicationCommandOptionType.Channel ? GuildBasedChannel
  : T extends ApplicationCommandOptionType.Integer ? number
  : T extends ApplicationCommandOptionType.Mentionable ? Role | (User & { member?: GuildMember })
  : T extends ApplicationCommandOptionType.Number ? number
  : T extends ApplicationCommandOptionType.Role ? Role
  : T extends ApplicationCommandOptionType.String ? string
  : T extends ApplicationCommandOptionType.User ? User & { member?: GuildMember } 
  : never;


export interface SlashCommandOptionChoice<T extends PrimitiveApplicationOptionType> extends Localized<'name'> {
  name: string,
  value: T extends ApplicationCommandOptionType.String ? string : number,
}

export interface SlashCommandOptionOptions<T extends ValueApplicationOptionType = ValueApplicationOptionType> extends Localized<'name'|'description'> {
  type: T;
  name: string;
  description: string;
  required?: boolean;
  channelTypes?: T extends ApplicationCommandOptionType.Channel ? ChannelType[] : never;
  autocomplete?: T extends PrimitiveApplicationOptionType ? boolean : never;
  
  choices?: T extends PrimitiveApplicationOptionType ? SlashCommandOptionChoice<T>[] : never;
  
  minValue?: T extends NumericApplicationOptionType ? number : never;
  maxValue?: T extends NumericApplicationOptionType ? number : never;
  
  minLength?: T extends ApplicationCommandOptionType.String ? number : never;
  maxLength?: T extends ApplicationCommandOptionType.String ? number : never;
}


export class SlashCommandOption<T extends ValueApplicationOptionType = ValueApplicationOptionType> implements Localized<'name'|'description'> {
  command: SlashCommand | SubCommand;
  type: T;
  name: string;
  description: string;
  required?: boolean;
  channelTypes?: ChannelType[];
  autocomplete?: boolean;
  
  localization?: Record<Locale, {
    name: string,
    description: string,
  }>;
  
  choices?: T extends PrimitiveApplicationOptionType ? SlashCommandOptionChoice<T>[] : never;
  
  minValue?: number;
  maxValue?: number;
  
  minLength?: number;
  maxLength?: number;

  constructor(command: SlashCommand | SubCommand, options: SlashCommandOptionOptions<T>) {
    this.command = command;
    this.type = options.type;
    this.name = options.name;
    this.description = options.description;
    this.required = options.required;
    this.channelTypes = options.channelTypes;
    this.autocomplete = options.autocomplete;
    this.localization = options.localization;
    this.choices = options.choices;
    this.minValue = options.minValue;
    this.maxValue = options.maxValue;
    this.minLength = options.minLength;
    this.maxLength = options.maxLength;
  }

  getLocalizedName(locale: Locale, fail = false): string {
    const localizedName = this.localization?.[locale]?.name;
    if (fail) throw new Error(`no localized name found for option ${this.name} of command ${this.command.id} in locale ${locale}`);
    return localizedName || this.name;
  }

  getLocalizedDescription(locale: Locale, fail = false): string {
    const localizedDescription = this.localization?.[locale]?.description;
    if (fail) throw new Error(`no localized description found for option ${this.name} of command ${this.command.id} in locale ${locale}`);
    return localizedDescription || this.description;
  }

  get APIData(): APIApplicationCommandBasicOption {
    return <APIApplicationCommandBasicOption>{
      type: this.type,
      name: this.name,
      name_localizations: this.localization
        && Object.fromEntries(Object.entries(this.localization).map(([locale, localization]) => [locale, localization.name])),
      description: this.description,
      description_localizations: this.localization
        && Object.fromEntries(Object.entries(this.localization).map(([locale, localization]) => [locale, localization.name])),
      required: this.required,
      channel_types: this.channelTypes,
      min_value: this.minValue,
      max_value: this.maxValue,
      min_length: this.minLength,
      max_length: this.maxLength,
      autocomplete: this.autocomplete,
      choices: this.choices && this.choices.map((choice: SlashCommandOptionChoice<any>) => (<any>{
        name: choice.name,
        name_localizations: choice.localization && Object.fromEntries(Object.entries(choice.localization).map(([locale, localization]) => [locale, localization.name])),
        value: choice.value,
      })),
    }
  }
}