import {
  ChatInputApplicationCommandData,
  ApplicationCommandSubGroupData,
  Collection,
  CommandInteraction,
  ContextMenuInteraction,
  ApplicationCommandData,
} from 'discord.js';

import * as log from './logging.js';
import { WithFlags, Command, CommandData, StandaloneSubcommandData } from './command.js';
import { ModalInteraction } from './modal.js';


declare module 'discord.js' {

}


export class ContextCommand extends Command {
  override data: ApplicationCommandData;
  run: (interaction: ContextMenuInteraction) => any;

  constructor(data: WithFlags<ApplicationCommandData>, run: (interaction: ContextMenuInteraction) => any) {
    super(data);
    this.data = data;
    this.run = run;
  }

  async execute(interaction: ContextMenuInteraction) {
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
  run: (interaction: ModalInteraction) => any;

  constructor(data: CommandData, run: (interaction: ModalInteraction) => any) {
    super(data);
    this.run = run;
  }

  async execute(interaction: ModalInteraction) {
    try {
      await this.run(interaction);
    } catch (err) {
      log.error(err);
      // const res = {
      //   content: 'Something went wrong executing the command',
      //   ephemeral: true,
      // };
      // interaction.replied ? interaction.followUp(res) : interaction.reply(res);
    }
  }
}


export class SlashCommand extends Command {
  override data: ChatInputApplicationCommandData;
  subcommands: Collection<string, Subcommand>;
  run: (interaction: CommandInteraction) => any;

  constructor(data: WithFlags<ChatInputApplicationCommandData>, run: (interaction: CommandInteraction) => any) {
    super(data);
    data.type ||= 1;
    this.data = data;
    
    this.subcommands = new Collection();
    
    this.run = run;
  }


  subcommand(data: WithFlags<StandaloneSubcommandData>, run: (interaction: CommandInteraction) => any) {
    return new Subcommand(this, data, run);
  }


  async execute(interaction: CommandInteraction) {
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


export class Subcommand extends Command {
  command: SlashCommand;
  override data: StandaloneSubcommandData;
  group?: string;
  run: (interaction: CommandInteraction) => any;

  constructor(command: SlashCommand, data: WithFlags<StandaloneSubcommandData>, run: (interaction: CommandInteraction) => any) {
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


  async execute(interaction: CommandInteraction) {
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