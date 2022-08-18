import { ApplicationCommandData, Client, ClientOptions, Events, Interaction, Message } from 'discord.js';
import XRegExp from 'xregexp';

import {
  Command,
  CommandManager,
  ContextCommand,
  ModalHandler,
  SlashCommand,
  PrefixCommand,
} from './commands';
import { EventManager, Event } from './events';

declare module 'discord.js' {
  interface Client {
    commands?: CommandManager;
    events?: EventManager;
    owners?: string[];
    prefix?: string;
  }
}

export interface CommandRegisterOptions {
  global?: boolean;
  guilds?: string[];
}

export interface BotOptions extends ClientOptions {
  commands?: Command[];
  events?: Event[];
  owner?: string;
  owners?: string[];
  prefix?: string;
  register?: CommandRegisterOptions;
}

export class Bot extends Client {
  commands: CommandManager;
  events: EventManager;
  owners: string[];

  constructor(options: BotOptions) {
    options.intents ||= [1<<0, 1<<9];
    super(options);
    this.owners = (options.owners || [options.owner] || []) as string[];
    this.commands = new CommandManager(this, options.commands);
    this.events = new EventManager(this, (options.events || []).concat(Bot.defaultEvents));
    
    this.prefix = options.prefix;
    
    if (options.register) this.on(Events.ClientReady, () => this.register(options.register!));
  }

  async register(options: CommandRegisterOptions) {
    options.guilds ??= [];
    options.global ??= false;

    if (options.global) {
      const commands = await this.application!.commands.fetch();
      const different = commands.size !== this.commands.appCommands.size || !commands.every(command => command.equals(<ApplicationCommandData>this.commands.resolveAppCommand(command.name)?.data || {}));
      if (different) await this.application!.commands.set(this.commands.appCommands.map(cmd => <ApplicationCommandData>cmd.data));
      for (const id of options.guilds) {
        this.guilds.resolve(id)?.commands.set([]);
      }
      return;
    }

    for (const id of options.guilds) {
      const guild = this.guilds.resolve(id);
      if (!guild) continue;
      const commands = await guild.commands.fetch();
      const different = commands.size !== this.commands.appCommands.size || !commands.every(command => command.equals(<ApplicationCommandData>this.commands.resolveAppCommand(command.name)?.data || {}));
      if (different) await guild.commands.set(this.commands.appCommands.map(cmd => <ApplicationCommandData>cmd.data));
    }
  }


  static defaultEvents = [
    new Event({ event: Events.InteractionCreate, _default: true }, async function (interaction: Interaction) {
      if (interaction.isChatInputCommand()) {
        const cmd = interaction.client.commands?.resolveAppCommand(interaction.commandName) as SlashCommand | undefined;
        return cmd && cmd.execute(interaction);
      }
  
      if (interaction.isContextMenuCommand()) {
        const cmd = interaction.client.commands?.resolveAppCommand(interaction.commandName) as ContextCommand | undefined;
        return cmd && cmd.execute(interaction);
      }

      if (interaction.isModalSubmit()) {
        const cmd = interaction.client.commands?.resolveAppCommand(interaction.customId) as ModalHandler | undefined;        
        return cmd && cmd.execute(interaction);
      }
    }),

    new Event({ event: Events.MessageCreate, _default: true }, async function (message: Message) {
      if (message.author.bot) return;
      const prefix = XRegExp(message.client.prefix 
        ? `^(<@${message.client.user!.id}>|${XRegExp.escape(message.client.prefix)})` 
        : `^<@${message.client.user!.id}>`
      ).exec(message.content)?.[0];
      if (!prefix) return;

      const args = message.content.slice(prefix.length).split(/ +/);
      const commandName = args.shift();
      const cmd = commandName && message.client.commands?.resolvePrefixCommand(commandName) as PrefixCommand;
      if (cmd) cmd.execute(message, args);
    }),

    new Event({ event: Events.ClientReady }, async function (client: Bot) {
      
      const commands = await client.application!.commands.fetch();
      const same = commands.every(command => command.equals(<ApplicationCommandData>client.commands.resolveAppCommand(command.name)?.data || {}));
      if (same) return;
      
    })
  ];
}