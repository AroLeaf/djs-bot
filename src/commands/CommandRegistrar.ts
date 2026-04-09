import { ApplicationCommand, Collection } from 'discord.js';
import type { CommandManager } from '../managers';
import { InteractionCommand } from './InteractionCommand';

export interface CommandSyncOptions {
  guilds?: string[],
  global?: boolean,
  clearImpliedGuilds?: boolean,
}

export class CommandRegistrar {
  defaultSyncOptions: CommandSyncOptions;
  manager: CommandManager;
  
  constructor(manager: CommandManager, defaultSyncOptions: CommandSyncOptions = {}) {
    this.manager = manager;
    this.defaultSyncOptions = defaultSyncOptions;
  }

  #groupCommands(commands: Iterable<InteractionCommand>, options: CommandSyncOptions): Collection<string, InteractionCommand[]> {
    const grouped: Collection<string, InteractionCommand[]> = new Collection(this.manager.client.guilds.cache.keys().map(key => [key, []])).set('global', []);

    for (const command of commands) {
      if (command.guilds) {
        for (const guildId of command.guilds) grouped.get(guildId)?.push(command);
        continue;
      }

      if (options.global) {
        grouped.get('global')!.push(command);
        continue;
      }

      for (const guildId of options.guilds ?? []) grouped.get(guildId)?.push(command);
    }
    
    return grouped;
  }

  #isDesynced(local: InteractionCommand[], remote: ApplicationCommand[]) {
    if (local.length !== remote.length) return true;
    
    const localObj = Object.fromEntries(local.map(command => [command.id, command]));
    
    for (const command of remote) {
      const id = InteractionCommand.generateId(command.type, command.name);
      if (!(id in localObj)) return true;
      if (!command.equals(localObj[id]!.APIData)) return true;
    }
    
    return false;
  }

  async sync(options: CommandSyncOptions = this.defaultSyncOptions): Promise<void> {
    const grouped = this.#groupCommands(this.manager.getApplicationCommands().values(), options);
    const guildSet = new Set(options.guilds);

    for (const [guildId, commands] of grouped) {
      if (!options.clearImpliedGuilds && !guildSet.has(guildId) && !commands.length) continue;

      const commandManager = guildId === 'global'
        ? this.manager.client.application?.commands
        : this.manager.client.guilds.resolve(guildId)?.commands;
      if (!commandManager) continue;
      
      const applicationCommands = await commandManager.fetch({});
      if (this.#isDesynced(commands, applicationCommands.values().toArray()))
        commandManager.set(commands.map(command => command.APIData));
    }
  }
}