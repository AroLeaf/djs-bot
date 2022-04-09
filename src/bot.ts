import { Client, ClientOptions, Interaction } from 'discord.js';

import { CommandManager } from './commandManager.js';
import { Command } from './command.js';
import { ContextCommand, ModalHandler, SlashCommand } from './appCommand.js';
import { EventManager } from './eventManager.js';
import { Event } from './event.js';
import { ModalInteraction } from './modal.js';
import { RawInteractionData } from 'discord.js/typings/rawDataTypes';

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
    // new Event({ event: 'messageCreate', _default: true }, async function (message: Message) {
    //   if (message.author.bot) return;
    //   if (!message.content.startsWith(message.client.prefix||'')) return;
    // }),
  ];

  static onINTERACTION_CREATE(client: Client, interaction: RawInteractionData) {
    // @ts-expect-error
    if (interaction.type !== 5) return;
    // @ts-expect-error
    client.emit('interactionCreate', new ModalInteraction(client, interaction));
  }
}