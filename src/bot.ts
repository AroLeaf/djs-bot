import {
  ApplicationCommand,
  ApplicationCommandData,
  ApplicationCommandType,
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  GuildResolvable,
} from 'discord.js';
import * as defaultEvents from './events/default/index';

import { CommandManager } from './commands';
import { EventManager } from './events';
import { BotOptions, CommandRegisterOptions } from './types';
import { ComponentsManager } from './componentsManager';

export class Bot extends Client {
  commands: CommandManager;
  events: EventManager;
  components: ComponentsManager;
  owners: string[];

  constructor(options: BotOptions) {
    options.intents ||= [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages ];
    super(options);
    
    this.owners = (options.owners || [options.owner] || []) as string[];
    this.prefix = options.prefix;
    
    this.commands = new CommandManager(this, options.commands);
    this.events = new EventManager(this, (options.events || []).concat(Object
      .entries(defaultEvents)
      .filter(([k]) => options.defaultEvents?.[k] ?? true)
      .map(([,e]) => e)
    ));
    this.components = new ComponentsManager();
    
    if (options.register) this.on(Events.ClientReady, () => this.register(options.register!));
  }


  async register(options: CommandRegisterOptions = {}) {
    options.guilds ??= [];
    options.global ??= false;

    const commands = [
      ...this.commands.slashCommands.values(),
      ...this.commands.userCommands.values(),
      ...this.commands.messageCommands.values(),
    ].map(cmd => cmd.data);

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
}