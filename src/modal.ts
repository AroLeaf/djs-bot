import { APIGuildMember, APIMessage, APIUser } from 'discord.js/node_modules/discord-api-types';
import {
  Client,
  Interaction,
  InteractionDeferReplyOptions,
  InteractionDeferUpdateOptions,
  InteractionReplyOptions,
  InteractionType,
  InteractionUpdateOptions,
  InteractionWebhook,
  MessagePayload,
  MessageTarget,
  WebhookEditMessageOptions,
  WebhookMessageOptions,
} from 'discord.js';

declare module 'discord.js' {
  interface Interaction {
    modal: (modal: Modal) => any;
    isModal: () => boolean;
  }
}

export interface TextComponent {
  customId: string;
  multiline?: boolean;
  label: string;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  value?: string;
  placeholder?: string;
}

export interface Modal {
  title: string;
  customId: string;
  fields: TextComponent[];
}

Interaction.prototype.modal = function(modal: Modal) {
  if (['MODAL_SUBMIT', 'PING'].includes(this.type)) throw new Error(`Can't respond to an interaction of type ${this.type} with a modal`);
  // @ts-expect-error
  return this.client.api.interactions(this.id)(this.token).callback.post({
    data: {
      type: 9,
      data: {
        custom_id: modal.customId,
        title: modal.title,
        components: [{
          type: 1,
          components: modal.fields.map(field => ({
            type: 4,
            custom_id: field.customId,
            style: field.multiline ?? true ? 2 : 1,
            label: field.label,
            min_length: field.minLength,
            max_length: field.maxLength,
            required: field.required,
            value: field.value,
            placeholder: field.placeholder,
          })),
        }],
      }
    }
  });
}

Interaction.prototype.isModal = function() {
  return false;
}


export interface RawModalInteractionData {
  id: string;
  application_id: string;
  type: number;
  data: {
    custom_id: string;
    components: {
      type: 1;
      components: {
        type: 4,
        custom_id: string,
        style: 1|2,
        label: string,
        min_length?: number,
        max_length?: number,
        required?: boolean,
        value?: string,
        placeholder?: string,
      }[];
    }[];
  };
  guild_id?: string;
  channel_id?: string;
  member?: APIGuildMember;
  user?: APIUser;
  token: string;
  version: number;
  message?: APIMessage;
  locale?: string;
  guild_locale?: string;
}

export class ModalInteraction extends Interaction {
  // @ts-expect-error
  override type: InteractionType | 'MODAL_SUBMIT';
  customId: string;
  fields: TextComponent[];
  deferred: boolean;
  ephemeral?: boolean|null;
  replied: boolean;
  webhook: InteractionWebhook;

  constructor(client: Client, data: RawModalInteractionData) {
    // @ts-expect-error
    super(client, data);
    this.type = 'MODAL_SUBMIT';
    this.customId = data.data.custom_id;
    
    this.fields = data.data.components.map(row => row.components.map(field => ({
      customId: field.custom_id,
      multiline: field.style == 2,
      label: field.label,
      minLength: field.min_length,
      maxLength: field.max_length,
      required: field.required,
      placeholder: field.placeholder,
      value: field.value,
    }))).flat();
    
    this.deferred = false;
    this.ephemeral = null;
    this.replied = false;
    this.webhook = new InteractionWebhook(this.client, this.applicationId, this.token);
  }

  override isModal = () => true;

  /**
   * Defers the reply to this interaction.
   * @param {InteractionDeferReplyOptions} [options] Options for deferring the reply to this interaction
   * @returns {Promise<Message|APIMessage|void>}
   * @example
   * // Defer the reply to this interaction
   * interaction.deferReply()
   *   .then(console.log)
   *   .catch(console.error)
   * @example
   * // Defer to send an ephemeral reply later
   * interaction.deferReply({ ephemeral: true })
   *   .then(console.log)
   *   .catch(console.error);
   */
  async deferReply(options: InteractionDeferReplyOptions = {}) {
    if (this.deferred || this.replied) throw new Error('INTERACTION_ALREADY_REPLIED');
    this.ephemeral = options.ephemeral ?? false;
    // @ts-expect-error
    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: 5,
        data: {
          flags: options.ephemeral ? 1<<6 : undefined,
        },
      },
      auth: false,
    });
    this.deferred = true;

    return options.fetchReply ? this.fetchReply() : undefined;
  }

  /**
   * Creates a reply to this interaction.
   * <info>Use the `fetchReply` option to get the bot's reply message.</info>
   * @param {string|MessagePayload|InteractionReplyOptions} options The options for the reply
   * @returns {Promise<Message|APIMessage|void>}
   * @example
   * // Reply to the interaction and fetch the response
   * interaction.reply({ content: 'Pong!', fetchReply: true })
   *   .then((message) => console.log(`Reply sent with content ${message.content}`))
   *   .catch(console.error);
   * @example
   * // Create an ephemeral reply with an embed
   * const embed = new MessageEmbed().setDescription('Pong!');
   *
   * interaction.reply({ embeds: [embed], ephemeral: true })
   *   .then(() => console.log('Reply sent.'))
   *   .catch(console.error);
   */
  async reply(options: string|MessagePayload|InteractionReplyOptions) {
    if (this.deferred || this.replied) throw new Error('INTERACTION_ALREADY_REPLIED');
    // @ts-expect-error
    this.ephemeral = options.ephemeral ?? false;

    let messagePayload;
    if (options instanceof MessagePayload) messagePayload = options;
    else messagePayload = MessagePayload.create(this as MessageTarget, options);

    const { data, files } = await messagePayload.resolveData().resolveFiles();

    // @ts-expect-error
    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: 4,
        data,
      },
      files,
      auth: false,
    });
    this.replied = true;

    // @ts-expect-error
    return options.fetchReply ? this.fetchReply() : undefined;
  }

  /**
   * Fetches the initial reply to this interaction.
   * @see Webhook#fetchMessage
   * @returns {Promise<Message|APIMessage>}
   * @example
   * // Fetch the reply to this interaction
   * interaction.fetchReply()
   *   .then(reply => console.log(`Replied with ${reply.content}`))
   *   .catch(console.error);
   */
  fetchReply() {
    return this.webhook.fetchMessage('@original');
  }

  /**
   * Edits the initial reply to this interaction.
   * @see Webhook#editMessage
   * @param {string|MessagePayload|WebhookEditMessageOptions} options The new options for the message
   * @returns {Promise<Message|APIMessage>}
   * @example
   * // Edit the reply to this interaction
   * interaction.editReply('New content')
   *   .then(console.log)
   *   .catch(console.error);
   */
  async editReply(options: string|MessagePayload|WebhookEditMessageOptions) {
    if (!this.deferred && !this.replied) throw new Error('INTERACTION_NOT_REPLIED');
    const message = await this.webhook.editMessage('@original', options);
    this.replied = true;
    return message;
  }

  /**
   * Deletes the initial reply to this interaction.
   * @see Webhook#deleteMessage
   * @returns {Promise<void>}
   * @example
   * // Delete the reply to this interaction
   * interaction.deleteReply()
   *   .then(console.log)
   *   .catch(console.error);
   */
  async deleteReply() {
    if (this.ephemeral) throw new Error('INTERACTION_EPHEMERAL_REPLIED');
    await this.webhook.deleteMessage('@original');
  }

  /**
   * Send a follow-up message to this interaction.
   * @param {string|MessagePayload|InteractionReplyOptions} options The options for the reply
   * @returns {Promise<Message|APIMessage>}
   */
  followUp(options: string|MessagePayload|InteractionReplyOptions) {
    if (!this.deferred && !this.replied) return Promise.reject(new Error('INTERACTION_NOT_REPLIED'));
    return this.webhook.send(options);
  }

  /**
   * Defers an update to the message to which the component was attached.
   * @param {InteractionDeferUpdateOptions} [options] Options for deferring the update to this interaction
   * @returns {Promise<Message|APIMessage|void>}
   * @example
   * // Defer updating and reset the component's loading state
   * interaction.deferUpdate()
   *   .then(console.log)
   *   .catch(console.error);
   */
  async deferUpdate(options: InteractionDeferUpdateOptions = {}) {
    if (this.deferred || this.replied) throw new Error('INTERACTION_ALREADY_REPLIED');
    // @ts-expect-error
    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: 6,
      },
      auth: false,
    });
    this.deferred = true;

    return options.fetchReply ? this.fetchReply() : undefined;
  }

  /**
   * Updates the original message of the component on which the interaction was received on.
   * @param {string|MessagePayload|InteractionUpdateOptions} options The options for the updated message
   * @returns {Promise<Message|APIMessage|void>}
   * @example
   * // Remove the components from the message
   * interaction.update({
   *   content: "A component interaction was received",
   *   components: []
   * })
   *   .then(console.log)
   *   .catch(console.error);
   */
  async update(options: string|MessagePayload|InteractionUpdateOptions) {
    if (this.deferred || this.replied) throw new Error('INTERACTION_ALREADY_REPLIED');

    let messagePayload;
    if (options instanceof MessagePayload) messagePayload = options;
    else messagePayload = MessagePayload.create(this as MessageTarget, options as WebhookMessageOptions);

    const { data, files } = await messagePayload.resolveData().resolveFiles();

    // @ts-expect-error
    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: 7,
        data,
      },
      files,
      auth: false,
    });
    this.replied = true;

    // @ts-expect-error
    return options.fetchReply ? this.fetchReply() : undefined;
  }
}