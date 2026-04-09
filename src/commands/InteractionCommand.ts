import { PermissionFlagsBits, PermissionsBitField, type ApplicationCommandData, type ApplicationCommandType, type ApplicationIntegrationType, type InteractionContextType } from 'discord.js';
import { Command, type CommandOptions } from './Command';


export interface InteractionCommandOptions extends CommandOptions {
  installContexts?: ApplicationIntegrationType[];
  usageContexts?: InteractionContextType[];
  defaultMemberPermissions?: PermissionsBitField;
  nsfw?: boolean;
  guilds?: string[];
}


export abstract class InteractionCommand extends Command {
  abstract type: ApplicationCommandType;
  installContexts?: ApplicationIntegrationType[];
  usageContexts?: InteractionContextType[];
  defaultMemberPermissions?: PermissionsBitField;
  nsfw: boolean;
  guilds?: string[];

  constructor(options: InteractionCommandOptions) {
    super(options);
    this.installContexts = options.installContexts;
    this.usageContexts = options.usageContexts;
    this.defaultMemberPermissions = options.defaultMemberPermissions ?? new PermissionsBitField(PermissionFlagsBits.UseApplicationCommands);
    this.nsfw = options.nsfw ?? false;
    this.guilds = options.guilds;
  }

  static generateId(type: ApplicationCommandType, name: string): string {
    return `${type}:${name}`;
  }

  get id(): string {
    return InteractionCommand.generateId(this.type, this.name);
  }

  get APIData(): ApplicationCommandData {
    return {
      name: this.name,
      nameLocalizations: this.localization
        && Object.fromEntries(Object.entries(this.localization).map(([locale, localization]) => [locale, localization.name])),
      description: this.description,
      descriptionLocalizations: this.localization
        && Object.fromEntries(Object.entries(this.localization).map(([locale, localization]) => [locale, localization.description])),
      defaultMemberPermissions: this.defaultMemberPermissions,
      integrationTypes: this.installContexts,
      contexts: this.usageContexts,
      type: this.type,
      nsfw: this.nsfw,
    }
  }
}