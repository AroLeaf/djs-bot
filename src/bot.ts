import {
  ApplicationCommand,
  ApplicationCommandData,
  ApplicationCommandType,
  AutocompleteInteraction,
  Client,
  Collection,
  Events,
  GuildResolvable,
  Interaction,
  Message 
} from 'discord.js';
import XRegExp from 'xregexp';

import { CommandManager } from './commands';
import { EventManager, Event } from './events';
import { BotOptions, CommandRegisterOptions } from './types';

export class Bot extends Client {
  commands: CommandManager;
  events: EventManager;
  owners: string[];

  constructor(options: BotOptions) {
    options.intents ||= [1<<0, 1<<9];
    super(options);
    this.owners = (options.owners || [options.owner] || []) as string[];
    this.commands = new CommandManager(this, options.commands);
    this.events = new EventManager(this, (options.events || []).concat(Bot.defaultEvents));
    
    this.prefix = options.prefix;
    
    if (options.register) this.on(Events.ClientReady, () => this.register(options.register!));
  }

  async register(options: CommandRegisterOptions = {}) {
    options.guilds ??= [];
    options.global ??= false;

    const commands = <ApplicationCommandData[]>[
      ...this.commands.slashCommands.values(),
      ...this.commands.userCommands.values(),
      ...this.commands.messageCommands.values(),
    ];

    const isDifferent = (commands: Collection<string, ApplicationCommand<{ guild: GuildResolvable }>>) => {
      for (const type of [
        ApplicationCommandType.ChatInput,
        ApplicationCommandType.User,
        ApplicationCommandType.Message,
      ]) {
        const local = ({
          [ApplicationCommandType.ChatInput]: this.commands.slashCommands,
          [ApplicationCommandType.User]: this.commands.userCommands,
          [ApplicationCommandType.Message]: this.commands.messageCommands,
        })[type];
        const discord = commands.filter(cmd => cmd.type === type);

        if (local.size !== discord.size || commands.some(cmd => !cmd.equals(<ApplicationCommandData>local.get(cmd.name)?.data || {}))) return true;
      }

      return false;
    }

    if (options.global) {
      if (isDifferent(await this.application!.commands.fetch())) await this.application!.commands.set(commands);
      for (const id of options.guilds) {
        this.guilds.resolve(id)?.commands.set([]);
      }
      return;
    } else for (const id of options.guilds) {
      const guild = this.guilds.resolve(id);
      if (!guild) continue;
      if (isDifferent(await guild.commands.fetch())) await guild.commands.set(commands);
    }
  }


  static defaultEvents = [
    new Event({ event: Events.InteractionCreate, _default: true }, async function (interaction: Interaction<"cached">) {
      if (interaction.isChatInputCommand()) {
        const cmd = interaction.client.commands?.resolveSlashCommand(interaction.commandName);
        return cmd && cmd.execute(interaction);
      }
  
      if (interaction.isUserContextMenuCommand()) {
        const cmd = interaction.client.commands?.resolveUserCommand(interaction.commandName);
        return cmd && cmd.execute(interaction);
      }

      if (interaction.isModalSubmit()) {
        const cmd = interaction.client.commands?.resolveModalHandler(interaction.customId);        
        return cmd && cmd.execute(interaction);
      }

      if (interaction.isAutocomplete()) {
        const cmd = interaction.client.commands?.resolveSlashCommand(interaction.commandName);        
        return cmd && cmd.autocomplete(<AutocompleteInteraction<'cached'>>interaction);
      }
    }),

    new Event({ event: Events.MessageCreate, _default: true }, async function (message: Message) {
      if (message.author.bot) return;
      const prefix = XRegExp(message.client.prefix 
        ? `^(<@${message.client.user!.id}>|${XRegExp.escape(message.client.prefix)})` 
        : `^<@${message.client.user!.id}>`
      ).exec(message.content)?.[0];
      if (!prefix) return;

      const args = message.content.slice(prefix.length).split(/ +/);
      const commandName = args.shift();
      const cmd = commandName && message.client.commands?.resolvePrefixCommand(commandName);
      if (cmd) cmd.execute(message, args);
    }),
  ];
}