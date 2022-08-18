import { Collection, GuildChannel, GuildMember, Message, Role, User } from 'discord.js';
import { Command, BaseCommandData } from './command.js';
export interface Prefix {
    get(message: Message): string | undefined;
    test(message: Message): boolean;
    mention: boolean;
}
export declare function stringPrefix(prefix: string, mention?: boolean): Prefix;
export declare function regexPrefix(prefix: RegExp, mention?: boolean): Prefix;
export declare enum PrefixCommandOptionType {
    STRING = 0,
    NUMBER = 1,
    INTEGER = 2,
    USER = 3,
    MEMBER = 4,
    USERLIKE = 5,
    ROLE = 6,
    CHANNEL = 7,
    MESSAGE = 8
}
export declare type PrefixCommandOptionTypeString = 'STRING' | 'NUMBER' | 'INTEGER' | 'USER' | 'MEMBER' | 'USERLIKE' | 'ROLE' | 'CHANNEL' | 'MESSAGE';
export interface PrefixCommandOptionData {
    type: PrefixCommandOptionType | PrefixCommandOptionTypeString;
    name: string;
    description?: string;
    strict: boolean;
    required: boolean;
}
export interface PrefixCommandData {
    name: string;
    description?: string;
    options?: PrefixCommandOptionData[];
}
export declare type PrefixCommandOptionOptions = {
    type?: PrefixCommandOptionType | PrefixCommandOptionTypeString;
    name: string;
    description?: string;
    strict?: boolean;
    required?: boolean;
} | string;
export declare type ResolvedPrefixCommandOptionType = string | number | User | GuildMember | Role | GuildChannel | Message;
export declare type PrefixCommandArguments<Parsed = boolean> = Parsed extends true ? Collection<string, ResolvedPrefixCommandOptionType> & {
    raw: string[];
} : string[];
export declare class PrefixCommand extends Command {
    run: (message: Message, args: PrefixCommandArguments) => any;
    options?: PrefixCommandOptionData[];
    constructor(data: BaseCommandData<PrefixCommandData>, run: (message: Message, args: PrefixCommandArguments) => any);
    execute(message: Message, args: string[]): Promise<Message<boolean> | undefined>;
    static options(options: PrefixCommandOptionOptions | PrefixCommandOptionOptions[]): PrefixCommandOptionData[];
}
