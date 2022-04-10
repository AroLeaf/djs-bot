import { Collection, Client } from 'discord.js';

import { Command } from './command.js';
import { Subcommand } from './appCommand.js';

export class CommandManager {
  client: Client;
  cache: Collection<string, Command>;

  constructor(client: Client, commands: Command[] = []) {
    this.client = client;
    this.cache = new Collection(commands.filter(cmd => !(cmd instanceof Subcommand)).map(cmd => [cmd.name, cmd]));
  }

  resolve(command: Command | string) {
    if (command instanceof Subcommand) return command.command;
    if (typeof command !== 'string') return command;

    const [base] = command.split(/\.(.*)/) as [string, string | undefined];
    return this.cache.get(base);
  }
}