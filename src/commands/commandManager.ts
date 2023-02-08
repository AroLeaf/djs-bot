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


/**
 * A class to group and manage commands.
 */
export class CommandManager {
  /** The client that instantiated this CommandManager. */
  client: Client;
  /** A collection of all prefix commands. */
  prefixCommands: Collection<string, PrefixCommand>
  /** A collection of all slash commands. */
  slashCommands: Collection<string, SlashCommand>;
  /** A collection of all user context commands. */
  userCommands: Collection<string, ContextCommand>;
  /** A collection of all message context commands. */
  messageCommands: Collection<string, ContextCommand>
  /** A collection of all modal handlers. */
  modalHandlers: Collection<string, ModalHandler>;

  /**
   * Creates a new CommandManager.
   * @param client - the client instantiating this CommandManager
   * @param commands - all commands this CommandManager should manage
   */
  constructor(client: Client, commands: Command[] = []) {
    this.client = client;

    function createCommandCollection<T extends Constructable<Command>>(cls: T, type?: ApplicationCommandType) {
      return new Collection<string, InstanceType<T>>(commands.filter(cmd => cmd instanceof cls && (type ? 'type' in cmd.data && cmd.data.type === type : true)).map(cmd => [cmd.name, cmd as InstanceType<T>]));
    }

    this.slashCommands    = createCommandCollection(SlashCommand, ApplicationCommandType.ChatInput);
    this.userCommands     = createCommandCollection(ContextCommand, ApplicationCommandType.User);
    this.messageCommands  = createCommandCollection(ContextCommand, ApplicationCommandType.Message);
    this.modalHandlers    = createCommandCollection(ModalHandler);
    
    this.prefixCommands   = new Collection<string, PrefixCommand>(commands.filter(cmd => cmd instanceof PrefixCommand).flatMap((cmd) => [[cmd.name, cmd as PrefixCommand], ...(cmd as PrefixCommand).aliases.map((alias: string) => [alias, cmd as PrefixCommand])] as [string, PrefixCommand][]));
  }

  /**
   * Tries to find a slash command by its name.
   * @param command - the name of the command to find
   * @returns the command if found, or undefined
   */
  resolveSlashCommand(command: SlashCommand | Subcommand | string) {
    if (command instanceof Subcommand) return command.command;
    if (typeof command !== 'string') return command;

    const [base] = command.split(/\.(.*)/) as [string, string | undefined];
    return this.slashCommands.get(base);
  }

  /**
   * Tries to find a subcommand by its tag (`command.subcommand` / `command.subcommandgroup.subcommand`).
   * @param command - the name of the subcommand to find
   * @returns the subcommand if found, or undefined
   */
  resolveSubCommand(command: Subcommand | string) {
    if (typeof command !== 'string') return command;
    const [base, sub] = command.split(/\.(.*)/) as [string, string | undefined];
    return this.slashCommands.get(base)?.subcommands.get(sub!);
  }

  /**
   * Tries to find a user context command by its name.
   * @param command - the name of the command to find
   * @returns the command if found, or undefined
   */
  resolveUserCommand(command: ContextCommand | string) {
    if (typeof command !== 'string') return command;
    return this.userCommands.get(command);
  }

  /**
   * Tries to find a message context command by its name.
   * @param command - the name of the command to find
   * @returns the command if found, or undefined
   */
  resolveMessageCommand(command: ContextCommand | string) {
    if (typeof command !== 'string') return command;
    return this.messageCommands.get(command);
  }

  /**
   * Tries to find a prefix command by its name.
   * @param command - the name of the command to find
   * @returns the command if found, or undefined
   */
  resolvePrefixCommand(command: PrefixCommand | string) {
    if (typeof command !== 'string') return command;
    return this.prefixCommands.get(command);
  }

  /**
   * Tries to find a modal handler by its name.
   * @param handler - the name of the modal handler to find
   * @returns the modal handler if found, or undefined
   */
  resolveModalHandler(handler: ModalHandler | string) {
    if (typeof handler !== 'string') return handler;
    return this.modalHandlers.get(handler);
  }
}