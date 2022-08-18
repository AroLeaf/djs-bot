import { ApplicationCommandData, BitField, Message, BitFieldResolvable, PermissionResolvable, PermissionsBitField, CommandInteraction } from 'discord.js';
import type { StandaloneSubcommandData } from './appCommand.js';
import type { PrefixCommandData } from './prefixCommand.js';
export declare type CommandFlagString = 'OWNER_ONLY' | 'GUILD_ONLY';
export declare type CommandFlagResolvable = BitFieldResolvable<CommandFlagString, number>;
export declare class CommandFlagsBitField extends BitField<CommandFlagString, number> {
    static Flags: {
        OWNER_ONLY: number;
        GUILD_ONLY: number;
    };
}
export interface CommandPermissionsResolvable {
    self: PermissionResolvable;
    user: PermissionResolvable;
}
interface CommandPermissions {
    self: PermissionsBitField;
    user: PermissionsBitField;
}
export declare type BaseCommandData<T> = T & {
    flags?: CommandFlagResolvable;
    permissions?: CommandPermissionsResolvable;
};
export declare type CommandData = BaseCommandData<ApplicationCommandData | StandaloneSubcommandData | PrefixCommandData>;
export declare class Command {
    name: string;
    description?: string;
    flags: CommandFlagsBitField;
    data: CommandData;
    perms: CommandPermissions;
    constructor(data: CommandData);
    check(request: CommandInteraction<'cached'> | Message): true | Promise<Message<boolean>> | Promise<import("discord.js").InteractionResponse<true>>;
}
export {};
