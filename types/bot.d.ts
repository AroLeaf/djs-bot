import { Client, ClientOptions } from 'discord.js';
import { Command, CommandManager } from './commands';
import { EventManager, Event } from './events';
declare module 'discord.js' {
    interface Client {
        commands?: CommandManager;
        events?: EventManager;
        owners?: string[];
        prefix?: string;
    }
}
export interface CommandRegisterOptions {
    global?: boolean;
    guilds?: string[];
}
export interface BotOptions extends ClientOptions {
    commands?: Command[];
    events?: Event[];
    owner?: string;
    owners?: string[];
    prefix?: string;
    register?: CommandRegisterOptions;
}
export declare class Bot extends Client {
    commands: CommandManager;
    events: EventManager;
    owners: string[];
    constructor(options: BotOptions);
    register(options: CommandRegisterOptions): Promise<void>;
    static defaultEvents: Event[];
}
