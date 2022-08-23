import {
  ChatInputApplicationCommandData,
  ApplicationCommandSubGroupData,
  Collection,
  ContextMenuCommandInteraction,
  ApplicationCommandSubCommandData,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  UserApplicationCommandData,
  MessageApplicationCommandData,
  ApplicationCommandOptionData,
  AutocompleteInteraction,
  ApplicationCommandChoicesData,
  ApplicationCommandNonOptionsData,
  ApplicationCommandChannelOptionData,
  ApplicationCommandAutocompleteOption,
  ApplicationCommandNumericOptionData,
  ApplicationCommandRoleOptionData,
  ApplicationCommandUserOptionData,
  ApplicationCommandMentionableOptionData,
  ApplicationCommandStringOptionData,
  ApplicationCommandBooleanOption,
} from 'discord.js';

import * as log from '../logging.js';
import { objectOmit } from '../util.js';
import { BaseCommandData, Command, CommandData } from './command.js';


export type ContextCommandData = (UserApplicationCommandData | MessageApplicationCommandData) & {
  guilds?: string[]
}


export class ContextCommand extends Command {
  data: UserApplicationCommandData | MessageApplicationCommandData;
  guilds?: string[];
  run: (interaction: ContextMenuCommandInteraction) => any;

  constructor(data: BaseCommandData<ContextCommandData>, run: (interaction: ContextMenuCommandInteraction) => any) {
    super(data);
    this.data = objectOmit(data, 'guilds', 'flags');
    this.guilds = data.guilds;
    this.run = run;
  }

  async execute(interaction: ContextMenuCommandInteraction) {
    try {
      await this.run(interaction);
    } catch (err) {
      log.error(err);
      const res = {
        content: 'Something went wrong executing the command',
        ephemeral: true,
      };
      interaction.replied ? interaction.followUp(res) : interaction.reply(res);
    }
  }
}


export class ModalHandler extends Command {
  run: (interaction: ModalSubmitInteraction) => any;

  constructor(data: CommandData, run: (interaction: ModalSubmitInteraction) => any) {
    super(data);
    this.run = run;
  }

  async execute(interaction: ModalSubmitInteraction) {
    try {
      await this.run(interaction);
    } catch (err) {
      log.error(err);
      const res = {
        content: 'Something went wrong executing the command',
        ephemeral: true,
      };
      interaction.replied ? interaction.followUp(res) : interaction.reply(res);
    }
  }
}


export type autocompleteHandler = (interaction: AutocompleteInteraction<'cached'>) => any;

export type SlashCommandOptionData = ApplicationCommandOptionData & {
  onAutocomplete?: autocompleteHandler;
}

export interface SlashCommandData extends ChatInputApplicationCommandData {
  guilds: string[];
  options?: SlashCommandOptionData[];
}


export class SlashCommand extends Command {
  data: ChatInputApplicationCommandData;
  guilds: string[];
  subcommands = new Collection<string, Subcommand>();
  autocompleteHandlers = new Collection<string, autocompleteHandler>();
  run: (interaction: ChatInputCommandInteraction) => any;

  constructor(data: BaseCommandData<SlashCommandData>, run: (interaction: ChatInputCommandInteraction) => any) {
    super(data);
    data.type ||= 1;
    this.data = objectOmit(data, 'guilds', 'flags');
    this.data.options = <ApplicationCommandOptionData[]>data.options?.map(o => objectOmit(o, 'onAutocomplete'));
    this.guilds = data.guilds;
    this.run = run;

    for (const option of data.options || []) {
      if (!option.autocomplete) continue;
      if (!option.onAutocomplete) {
        log.warn(`option '${option.name}' on command '${data.name}' has autocomplete enabled, but no autocomplete handler`);
        continue;
      }
      this.autocompleteHandlers.set(option.name, option.onAutocomplete);
    }
  }


  subcommand(data: BaseCommandData<StandaloneSubcommandData>, run: (interaction: ChatInputCommandInteraction) => any) {
    return new Subcommand(this, data, run);
  }


  async execute(interaction: ChatInputCommandInteraction) {
    const sub = interaction.options.getSubcommand(false);
    if (sub) {
      const group = interaction.options.getSubcommandGroup(false);
      const label = group ? `${group}.${sub}` : sub;
      const cmd = this.subcommands.get(label);
      if (cmd) return cmd.execute(interaction);
    }

    try {
      await this.run(interaction);
    } catch (err) {
      log.error(err);
      const res = {
        content: 'Something went wrong executing the command',
        ephemeral: true,
      };
      interaction.replied ? interaction.followUp(res) : interaction.reply(res);
    }
  }

  async autocomplete(interaction: AutocompleteInteraction<'cached'>) {
    const sub = interaction.options.getSubcommand(false);
    if (sub) {
      const group = interaction.options.getSubcommandGroup(false);
      const label = group ? `${group}.${sub}` : sub;
      const cmd = this.subcommands.get(label);
      if (cmd) return cmd.autocomplete(interaction);
    }

    const callback = this.autocompleteHandlers.get(interaction.options.getFocused(true).name);
    try {
      if (!callback) throw new Error(`No autocomplete handler found for option ${interaction.options.getFocused(true).name}`);
      await callback(interaction);
    } catch (err) {
      log.error(err);
      interaction.responded || interaction.respond([]);
    }
  }
}

export type SubcommandOptionData = (
  | ApplicationCommandChoicesData
  | ApplicationCommandNonOptionsData
  | ApplicationCommandChannelOptionData
  | ApplicationCommandAutocompleteOption
  | ApplicationCommandNumericOptionData
  | ApplicationCommandRoleOptionData
  | ApplicationCommandUserOptionData
  | ApplicationCommandMentionableOptionData
  | ApplicationCommandStringOptionData
  | ApplicationCommandBooleanOption
) & {
  onAutocomplete?: autocompleteHandler;
}

export interface StandaloneSubcommandData extends ApplicationCommandSubCommandData {
  group?: string;
  options?: SubcommandOptionData[];
}

export class Subcommand extends Command {
  command: SlashCommand;
  data: StandaloneSubcommandData;
  group?: string;
  autocompleteHandlers = new Collection<string, autocompleteHandler>();
  run: (interaction: ChatInputCommandInteraction) => any;

  constructor(command: SlashCommand, data: BaseCommandData<StandaloneSubcommandData>, run: (interaction: ChatInputCommandInteraction) => any) {
    super(data);
    data.type = 1;
    this.data = data;
    this.data.options = <SubcommandOptionData[]>data.options?.map(o => objectOmit(o, 'onAutocomplete'));

    this.command = command;
    this.group = 'group' in data ? data.group : undefined;
    this.run = run;

    let parent: ChatInputApplicationCommandData | ApplicationCommandSubGroupData | undefined = this.command.data
    parent.options ||= [];
    if (this.group) {
      parent = parent.options.find(op => op.type === 2) as ApplicationCommandSubGroupData | undefined;
      if (!parent) log.warn(`group ${this.group} not found on command ${this.command.name}`);
    }
    if (parent) {
      command.subcommands.set(this.label, this);
      parent.options ||= [];
      parent.options.push(this.data);
    }
  }

  get label() {
    return this.group ? `${this.group}.${this.name}` : this.name;
  }


  async execute(interaction: ChatInputCommandInteraction) {
    try {
      await this.run(interaction);
    } catch (err) {
      log.error(err);
      const res = {
        content: 'Something went wrong executing the command',
        ephemeral: true,
      };
      interaction.replied ? interaction.followUp(res) : interaction.reply(res);
    }
  }

  async autocomplete(interaction: AutocompleteInteraction<'cached'>) {
    const callback = this.autocompleteHandlers.get(interaction.options.getFocused(true).name);
    try {
      if (!callback) throw new Error(`No autocomplete handler found for option ${interaction.options.getFocused(true).name} on command ${this.name}`);
      await callback(interaction);
    } catch (err) {
      log.error(err);
      interaction.responded || interaction.respond([]);
    }
  }
}