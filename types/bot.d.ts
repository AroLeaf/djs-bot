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
interface BotOptions extends ClientOptions {
    commands?: Command[];
    events?: Event[];
    owner?: string;
    owners?: string[];
    prefix?: string;
    register?: {
        global?: boolean;
        guilds?: string[];
    };
}
export declare class Bot extends Client {
    commands: CommandManager;
    events: EventManager;
    owners: string[];
    constructor(options: BotOptions);
    static defaultEvents: Event[];
    static register(): void;
}
export {};
