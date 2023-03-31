import { ApplicationCommand, ApplicationCommandData, ApplicationCommandType, Client, Collection, Events, Message, } from 'discord.js';
import XRegExp from 'xregexp';
import { SlashCommand } from './commands';
import CommandManager from './commands/commandManager';
import MessageCommand from './commands/messageCommand';
import UserCommand from './commands/userCommand';
import ComponentsManager from './componentsManager';
import { DefaultEvents, Event } from './events';
import EventManager from './events/eventManager';
import { EventKey, BotHookKey, BotHookArguments } from './types';
import { BotHookObject, BotOptions, CommandRegisterOptions, FunctionPrefix, Prefix } from './types/bot';

export default class Bot extends Client {
  owners: string[];
  prefix?: Prefix;
  hooks?: BotHookObject;
  commands: CommandManager;
  events: EventManager;
  components: ComponentsManager;

  constructor(options: BotOptions) {
    super(options);
    this.owners = options.owners || (options.owner ? [options.owner] : []);
    this.prefix = options.prefix ? Bot.parsePrefix(options.prefix) : undefined;
    this.hooks = options.hooks;
    this.commands = new CommandManager(this, options.commands);
    this.events = new EventManager(this, options.events?.concat(options.defaultEvents === false ? [] : <Event<EventKey>[]>DefaultEvents));
    this.components = new ComponentsManager(this);

    if (options.register) this.on(Events.ClientReady, () => this.registerCommmands(options.register));
  }

  async registerCommmands(options: CommandRegisterOptions = {}) {
    options.global ??= false;
    options.guilds ??= [];
    
    const toData = (command: { data: ApplicationCommandData }) => command.data;
    const all = new Collection<string, MessageCommand | UserCommand | SlashCommand>().concat(
      this.commands.slashCommands,
      this.commands.messageCommands,
      this.commands.userCommands
    );
    const commandData = {
      [ApplicationCommandType.ChatInput]: this.commands.slashCommands.mapValues(toData),
      [ApplicationCommandType.Message]: this.commands.messageCommands.mapValues(toData),
      [ApplicationCommandType.User]: this.commands.userCommands.mapValues(toData),
    }

    const isDifferent = (compare: Collection<string, ApplicationCommand>) => {
      for (const type of [
        ApplicationCommandType.ChatInput,
        ApplicationCommandType.Message,
        ApplicationCommandType.User,
      ]) {
        const filtered = compare.filter((command) => command.type === type);
        if (filtered.size !== commandData[type].size || filtered.some((command) => !command.equals(commandData[type].get(command.name) || <ApplicationCommandData>{}))) return true;
      }
      return false;
    }

    const guildCommands = new Collection<string, ApplicationCommandData[]>(options.guilds.map((guild) => [guild, []]));
    const globalCommands = [] as ApplicationCommandData[];
    for (const [,command] of all) {
      if (command.guilds) {
        for (const guild of command.guilds) {
          guildCommands.ensure(guild, () => []).push(command.data);
        }
        continue;
      }

      if (options.global) {
        globalCommands.push(command.data);
        continue;
      } else {
        for (const guild of options.guilds) {
          guildCommands.ensure(guild, () => []).push(command.data);
        }
      }
    }

    if (options.global && isDifferent(await this.application!.commands.fetch())) {
      await this.application!.commands.set(globalCommands);
    }

    for (const [guildId, commands] of guildCommands) {
      const guild = this.guilds.resolve(guildId);
      if (guild && isDifferent(await guild.commands.fetch())) {
        await guild.commands.set(commands);
      }
    }
  }

  hook<T extends BotHookKey>(events: T | T[], hook: (...args: BotHookArguments[T]) => boolean | undefined) {
    if (typeof events === 'string') events = [events] as T[];
    for (const event of events) {
      if (!this.hooks) this.hooks = {};
      this.hooks[event] ??= [];
      this.hooks[event]!.push(hook);
    }
  }


  static parsePrefix(prefix: string | RegExp | FunctionPrefix): Prefix {
    return {
      source: prefix,
      get: (<{ [key: string]: FunctionPrefix }>{
        'string': function (message: Message) {
          const regex = XRegExp(`^(?:${XRegExp.escape(prefix as string)}|<@!?${message.client.user.id}>)`);
          return regex.exec(message.content)?.[0];
        },
        'object': function (message: Message) {
          return (prefix as RegExp).exec(message.content)?.[0];
        },
        'function': function (message: Message) {
          return (prefix as FunctionPrefix)(message);
        }
      })[typeof prefix],
    }
  }
}