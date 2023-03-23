import { Client, Collection } from 'discord.js';
import Command from './command';
import MessageCommand from './messageCommand';
import ModalReceiver from './modal';
import PrefixCommand from './prefixCommand';
import SlashCommand from './slashCommand';
import UserCommand from './userCommand';

export default class CommandManager {
  client: Client;
  prefixCommands: Collection<string, PrefixCommand>;
  slashCommands: Collection<string, SlashCommand>;
  messageCommands: Collection<string, MessageCommand>;
  userCommands: Collection<string, UserCommand>;
  modalReceivers: Collection<string, ModalReceiver>;

  constructor(client: Client, commands: Command[] = []) {
    this.client = client;
    this.prefixCommands = new Collection();
    this.slashCommands = new Collection();
    this.messageCommands = new Collection();
    this.userCommands = new Collection();
    this.modalReceivers = new Collection();
    for (const command of commands) this.add(command);
  }

  add(command: Command) {
    if (command instanceof PrefixCommand) {
      this.prefixCommands.set(command.name, command);
    } else if (command instanceof SlashCommand) {
      this.slashCommands.set(command.name, command);
    } else if (command instanceof MessageCommand) {
      this.messageCommands.set(command.name, command);
    }  else if (command instanceof UserCommand) {
      this.userCommands.set(command.name, command);
    } else if (command instanceof ModalReceiver) {
      this.modalReceivers.set(command.name, command);
    }
  }

  resolvePrefixCommand(command: string | Command) {
    if (command instanceof Command) {
      return command instanceof PrefixCommand ? command : null;
    } else {
      return this.prefixCommands.get(command);
    }
  }

  resolveSlashCommand(command: string | Command) {
    if (command instanceof Command) {
      return command instanceof SlashCommand ? command : null;
    } else {
      const [ base, sub ] = command.split(/\.(.+)/) as [string, string?];
      const slashCommand = this.slashCommands.get(base);
      return sub ? slashCommand?.subcommands.get(sub) : slashCommand;
    }
  }

  resolveMessageCommand(command: string | Command) {
    if (command instanceof Command) {
      return command instanceof MessageCommand ? command : null;
    } else {
      return this.messageCommands.get(command);
    }
  }

  resolveUserCommand(command: string | Command) {
    if (command instanceof Command) {
      return command instanceof UserCommand ? command : null;
    } else {
      return this.userCommands.get(command);
    }
  }

  resolveModalReceiver(command: string | Command) {
    if (command instanceof Command) {
      return command instanceof ModalReceiver ? command : null;
    } else {
      return this.modalReceivers.get(command);
    }
  }
}