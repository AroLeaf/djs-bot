import { Client, Collection } from 'discord.js';
import { Command, type CommandSyncOptions } from '../commands';
import { CommandRegistrar } from '../commands';
import { InteractionCommand } from '../commands';

export interface CommandManagerOptions {
  commands?: Iterable<Command>;
  register?: CommandSyncOptions;
}

export class CommandManager {
  client: Client;
  registrar: CommandRegistrar;
  
  commands: Collection<string, Command>;

  constructor(client: Client, options: CommandManagerOptions = {}) {
    this.client = client;
    this.registrar = new CommandRegistrar(this, options.register);
    this.commands = new Collection();
    
    if (options.commands) for (const command of options.commands) this.add(command);
  }

  add(command: Command): this {
    this.commands.set(command.id, command);
    return this;
  }

  // TODO: add overloads
  resolve(id: string): Command {
    return this.commands.get(id);
  }

  getApplicationCommands(): Collection<string, InteractionCommand> {
    return this.commands.filter(command => command instanceof InteractionCommand);
  }
}