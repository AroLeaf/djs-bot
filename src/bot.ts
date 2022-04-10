import { Client, ClientOptions, Interaction, Message } from 'discord.js';
import XRegExp from 'xregexp';

import { CommandManager } from './commands/commandManager.js';
import { Command } from './commands/command.js';
import { ContextCommand, ModalHandler, SlashCommand } from './commands/appCommand.js';
import { EventManager } from './events/eventManager.js';
import { Event } from './events/event.js';
import { ModalInteraction } from './modal.js';
import { RawInteractionData } from 'discord.js/typings/rawDataTypes';
import { PrefixCommand } from './commands/prefixCommand.js';

declare module 'discord.js' {
  interface Client {
    commands?: CommandManager;
    events?: EventManager;
    owners?: string[];
    prefix?: string;
  }
}

interface BotOptions extends ClientOptions {
  commands?: Command[];
  events?: Event[];
  owner?: string;
  owners?: string[];
  prefix?: string;
}

export class Bot extends Client {
  override commands: CommandManager;
  override owners: string[];

  constructor(options: BotOptions) {
    options.intents ||= [1<<0, 1<<9];
    super(options);
    this.owners = (options.owners || [options.owner] || []) as string[];
    this.commands = new CommandManager(this, options.commands);
    this.events = new EventManager(this, (options.events || []).concat(Bot.defaultEvents))
    
    this.prefix = options.prefix;
  }


  override login(token?: string): Promise<string> {
    this.ws.on('INTERACTION_CREATE', interaction => Bot.onINTERACTION_CREATE(this, interaction));
    return super.login(token);
  }


  static defaultEvents = [
    new Event({ event: 'interactionCreate', _default: true }, async function (interaction: Interaction) {
      if (interaction.isCommand()) {
        const cmd = interaction.client.commands?.resolve(interaction.commandName) as SlashCommand | undefined;
        if (cmd) return cmd.execute(interaction);
      }
  
      if (interaction.isContextMenu()) {
        const cmd = interaction.client.commands?.resolve(interaction.commandName) as ContextCommand | undefined;
        if (cmd) return cmd.execute(interaction);
      }

      if (interaction.isModal()) {
        const cmd = interaction.client.commands?.resolve((interaction as ModalInteraction).customId) as ModalHandler | undefined;        
        if (cmd) return cmd.execute(interaction as ModalInteraction);
      }
    }),

    new Event({ event: 'messageCreate', _default: true }, async function (message: Message) {
      if (message.author.bot || !message.client.prefix) return;
      const prefix = XRegExp(`^(<@${message.client.user?.id}>|${XRegExp.escape(message.client.prefix)})`).exec(message.content)?.[0];
      if (!prefix) return;

      const args = message.content.slice(prefix.length).split(/ /);
      const commandName = args.shift();
      const cmd = commandName && message.client.commands?.resolve(commandName) as PrefixCommand;
      if (cmd) cmd.execute(message, args);
    }),
  ];

  static onINTERACTION_CREATE(client: Client, interaction: RawInteractionData) {
    // @ts-expect-error
    if (interaction.type !== 5) return;
    // @ts-expect-error
    client.emit('interactionCreate', new ModalInteraction(client, interaction));
  }
}