import { ButtonComponentData, ChannelSelectMenuComponentData, MentionableSelectMenuComponentData, MessageComponentInteraction, RoleSelectMenuComponentData, StringSelectMenuComponentData, UserSelectMenuComponentData } from 'discord.js';

export type ComponentHandler = (interaction: MessageComponentInteraction) => Promise<void>;

export type AnyComponentData =
  | ButtonComponentData
  | StringSelectMenuComponentData
  | UserSelectMenuComponentData
  | RoleSelectMenuComponentData
  | MentionableSelectMenuComponentData
  | ChannelSelectMenuComponentData;

export type ComponentOptions = AnyComponentData & {
  run?: ComponentHandler;
}