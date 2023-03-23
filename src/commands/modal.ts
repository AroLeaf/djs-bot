import { ComponentType, ModalComponentData, ModalSubmitInteraction } from 'discord.js';
import Command from './command';
import { ModalReceiverContext, ModalReceiverHandler, ModalReceiverOptions } from '../types/modal';
import { CommandOptions } from '../types';

export default class ModalReceiver extends Command {
  data: ModalComponentData;
  handler: ModalReceiverHandler;

  constructor(data: ModalReceiverOptions, handler: ModalReceiverHandler) {
    super(data as CommandOptions);
    this.data = {
      customId: data.name,
      title: data.title,
      components: [{
        type: ComponentType.ActionRow,
        components: data.fields,
      }],
    }
    this.handler = handler;
  }

  async run(interaction: ModalSubmitInteraction) {
    const fields = Object.fromEntries(interaction.fields.fields.map(field => [field.customId, field.value]));
    const context: ModalReceiverContext = {
      command: this,
      interaction,
    }

    const ok = await this.before(context, fields);
    if (!ok) return;

    try {
      await this.handler(context, fields);
    } catch(error) {
      return this.error(context, fields, error as Error);
    }

    await this.after(context, fields);
  }
}