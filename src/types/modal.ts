import { ModalSubmitInteraction, TextInputComponentData } from 'discord.js';
import { CommandContext, CommandOptions } from '.';
import ModalReceiver from '../commands/modal';

export interface ModalReceiverOptions extends CommandOptions<ModalReceiverContext> {
  guilds?: string[];
  title: string;
  fields: TextInputComponentData[];
}

export type ModalReceiverFields = { [key: string]: string }
export type ModalReceiverHandler = (context: ModalReceiverContext, fields: ModalReceiverFields ) => any;

export interface ModalReceiverContext extends CommandContext {
  command: ModalReceiver;
  interaction: ModalSubmitInteraction;
}