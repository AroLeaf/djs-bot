import {
  ChatInputApplicationCommandData,
  ApplicationCommandSubGroupData,
  Collection,
  ContextMenuCommandInteraction,
  ApplicationCommandData,
  ApplicationCommandSubCommandData,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
} from 'discord.js';

import * as log from '../logging.js';
import { BaseCommandData, Command, CommandData } from './command.js';


export class ContextCommand extends Command {
  override data: ApplicationCommandData;
  run: (interaction: ContextMenuCommandInteraction) => any;

  constructor(data: BaseCommandData<ApplicationCommandData>, run: (interaction: ContextMenuCommandInteraction) => any) {
    super(data);
    this.data = data;
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


export class SlashCommand extends Command {
  data: ChatInputApplicationCommandData;
  subcommands: Collection<string, Subcommand>;
  run: (interaction: ChatInputCommandInteraction) => any;

  constructor(data: BaseCommandData<ChatInputApplicationCommandData>, run: (interaction: ChatInputCommandInteraction) => any) {
    super(data);
    data.type ||= 1;
    this.data = data;
    
    this.subcommands = new Collection();
    
    this.run = run;
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
}


export interface StandaloneSubcommandData extends ApplicationCommandSubCommandData {
  group?: string;
}

export class Subcommand extends Command {
  command: SlashCommand;
  data: StandaloneSubcommandData;
  group?: string;
  run: (interaction: ChatInputCommandInteraction) => any;

  constructor(command: SlashCommand, data: BaseCommandData<StandaloneSubcommandData>, run: (interaction: ChatInputCommandInteraction) => any) {
    super(data);
    data.type = 1;
    this.data = data;

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
}