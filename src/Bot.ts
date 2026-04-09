import { Client, type ClientOptions } from 'discord.js';
import { CommandManager, EventManager, type CommandManagerOptions, type EventManagerOptions } from './managers';

declare module "discord.js" {
  interface Client {
    events: EventManager;
    commands: CommandManager;
  }
}


export interface BotOptions extends ClientOptions {
  commands?: CommandManagerOptions;
  events?: EventManagerOptions;
}


export class Bot extends Client {
  events: EventManager;
  commands: CommandManager;

  constructor(options: BotOptions) {
    super(options);

    this.events = new EventManager(this, options.events);
    this.commands = new CommandManager(this, options.commands);
  }
}