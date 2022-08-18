import { ChatInputApplicationCommandData, Collection, ContextMenuCommandInteraction, ApplicationCommandData, ApplicationCommandSubCommandData, ChatInputCommandInteraction, ModalSubmitInteraction } from 'discord.js';
import { BaseCommandData, Command, CommandData } from './command.js';
export declare class ContextCommand extends Command {
    data: ApplicationCommandData;
    run: (interaction: ContextMenuCommandInteraction) => any;
    constructor(data: BaseCommandData<ApplicationCommandData>, run: (interaction: ContextMenuCommandInteraction) => any);
    execute(interaction: ContextMenuCommandInteraction): Promise<void>;
}
export declare class ModalHandler extends Command {
    run: (interaction: ModalSubmitInteraction) => any;
    constructor(data: CommandData, run: (interaction: ModalSubmitInteraction) => any);
    execute(interaction: ModalSubmitInteraction): Promise<void>;
}
export declare class SlashCommand extends Command {
    data: ChatInputApplicationCommandData;
    subcommands: Collection<string, Subcommand>;
    run: (interaction: ChatInputCommandInteraction) => any;
    constructor(data: BaseCommandData<ChatInputApplicationCommandData>, run: (interaction: ChatInputCommandInteraction) => any);
    subcommand(data: BaseCommandData<StandaloneSubcommandData>, run: (interaction: ChatInputCommandInteraction) => any): Subcommand;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
export interface StandaloneSubcommandData extends ApplicationCommandSubCommandData {
    group?: string;
}
export declare class Subcommand extends Command {
    command: SlashCommand;
    data: StandaloneSubcommandData;
    group?: string;
    run: (interaction: ChatInputCommandInteraction) => any;
    constructor(command: SlashCommand, data: BaseCommandData<StandaloneSubcommandData>, run: (interaction: ChatInputCommandInteraction) => any);
    get label(): string;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
