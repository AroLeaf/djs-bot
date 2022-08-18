import { Collection, Client } from 'discord.js';

import { Command } from './command.js';
import { ContextCommand, ModalHandler, SlashCommand, Subcommand } from './appCommand.js';
import { PrefixCommand } from './prefixCommand.js';

export class CommandManager {
  client: Client;
  appCommands: Collection<string, ContextCommand | ModalHandler | SlashCommand>;
  prefixCommands: Collection<string, PrefixCommand>

  constructor(client: Client, commands: Command[] = []) {
    this.client = client;
    this.appCommands = new Collection(commands.filter(cmd => !(cmd instanceof Subcommand || cmd instanceof PrefixCommand)).map(cmd => [cmd.name, <ContextCommand | ModalHandler | SlashCommand>cmd]));
    this.prefixCommands = new Collection(commands.filter(cmd => cmd instanceof PrefixCommand).map(cmd => [cmd.name, <PrefixCommand>cmd]));
  }

  resolveAppCommand(command: ContextCommand | ModalHandler | SlashCommand | Subcommand | string) {
    if (command instanceof Subcommand) return command.command;
    if (typeof command !== 'string') return command;

    const [base] = command.split(/\.(.*)/) as [string, string | undefined];
    return this.appCommands.get(base);
  }

  resolvePrefixCommand(command: PrefixCommand | string) {
    return (typeof command === 'string') 
      ? this.prefixCommands.get(command)
      : command;
  }
}