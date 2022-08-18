import { Collection, Client } from 'discord.js';
import { Command } from './command.js';
import { ContextCommand, ModalHandler, SlashCommand, Subcommand } from './appCommand.js';
import { PrefixCommand } from './prefixCommand.js';
export declare class CommandManager {
    client: Client;
    appCommands: Collection<string, ContextCommand | ModalHandler | SlashCommand>;
    prefixCommands: Collection<string, PrefixCommand>;
    constructor(client: Client, commands?: Command[]);
    resolveAppCommand(command: ContextCommand | ModalHandler | SlashCommand | Subcommand | string): ContextCommand | ModalHandler | SlashCommand | undefined;
    resolvePrefixCommand(command: PrefixCommand | string): PrefixCommand | undefined;
}
