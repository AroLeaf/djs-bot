import {
  Collection,
  Client,
  Constructable,
  ApplicationCommandType,
} from 'discord.js';

import { Command } from './command.js';
import { ContextCommand } from './contextCommand.js';
import { ModalHandler } from './modalHandler.js';
import { PrefixCommand } from './prefixCommand.js';
import { SlashCommand } from './slashCommand.js';
import { Subcommand } from './subCommand.js';

export class CommandManager {
  client: Client;
  prefixCommands: Collection<string, PrefixCommand>
  slashCommands: Collection<string, SlashCommand>;
  userCommands: Collection<string, ContextCommand>;
  messageCommands: Collection<string, ContextCommand>
  modalHandlers: Collection<string, ModalHandler>;

  constructor(client: Client, commands: Command[] = []) {
    this.client = client;

    function createCommandCollection<T extends Constructable<Command>>(cls: T, type?: ApplicationCommandType) {
      return new Collection<string, InstanceType<T>>(commands.filter(cmd => cmd instanceof cls && (type ? 'type' in cmd.data && cmd.data.type === type : true)).map(cmd => [cmd.name, cmd as InstanceType<T>]));
    }

    this.prefixCommands   = createCommandCollection(PrefixCommand);
    this.slashCommands    = createCommandCollection(SlashCommand, ApplicationCommandType.ChatInput);
    this.userCommands     = createCommandCollection(ContextCommand, ApplicationCommandType.User);
    this.messageCommands  = createCommandCollection(ContextCommand, ApplicationCommandType.Message);
    this.modalHandlers    = createCommandCollection(ModalHandler);
  }

  resolveSlashCommand(command: SlashCommand | Subcommand | string) {
    if (command instanceof Subcommand) return command.command;
    if (typeof command !== 'string') return command;

    const [base] = command.split(/\.(.*)/) as [string, string | undefined];
    return this.slashCommands.get(base);
  }

  resolveSubCommand(command: Subcommand | string) {
    if (typeof command !== 'string') return command;
    const [base, sub] = command.split(/\.(.*)/) as [string, string | undefined];
    return this.slashCommands.get(base)?.subcommands.get(sub!);
  }

  resolveUserCommand(command: ContextCommand | string) {
    if (typeof command !== 'string') return command;
    return this.userCommands.get(command);
  }

  resolveMessageCommand(command: ContextCommand | string) {
    if (typeof command !== 'string') return command;
    return this.messageCommands.get(command);
  }

  resolvePrefixCommand(command: PrefixCommand | string) {
    if (typeof command !== 'string') return command;
    return this.prefixCommands.get(command);
  }

  resolveModalHandler(handler: ModalHandler | string) {
    if (typeof handler !== 'string') return handler;
    return this.modalHandlers.get(handler);
  }
}