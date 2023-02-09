import { Client, Collection, ComponentType } from 'discord.js';
import { ActionRowComponentData, ComponentData, ManagedComponentOptions } from './types';
import * as util from './util';


/**
 * A class for managing components.
 */
export class ComponentsManager {
  /** All components currently registered. */
  cache: Collection<string, ActionRowComponentData<true>>;
  /** The client that instantiated this manager. */
  client: Client;
  
  /**
   * Creates a new components manager.
   * @param client - the client instantiating this manager
   */
  constructor(client: Client) {
    this.client = client;
    this.cache = new Collection();
  }

  #generateId() {
    let id;
    do {
      id = Math.random().toString(36).slice(2, 8);
    } while (this.cache.has(id));
    return id;
  }

  /**
   * Registers a component.
   * @param data - the data for this component
   * @returns API-compatible component data
   * @example
   * ```js
   * await channel.send({
   *   content: 'Hello world!',
   *   components: [channel.client.components.create({
   *     type: ComponentType.Button,
   *     label: 'Click me!',
   *     style: ButtonStyle.Primary,
   *     run: async (interaction) => {
   *       return interaction.reply('You clicked me!');
   *     },
   *   })],
   * });
   */
  create(data: ManagedComponentOptions): ComponentData {
    if (Array.isArray(data)) data = { type: ComponentType.ActionRow, components: data };

    if (data.type === ComponentType.ActionRow) return {
      type: data.type,
      components: data.components.map((component: ManagedComponentOptions) => this.create(component) as ActionRowComponentData),
    } as ComponentData;

    const id = this.#generateId();
    this.cache.set(id, data);
    return { ...util.objectOmit(data, 'run'), customId: id } as ComponentData;
  }

  /**
   * Gets a component by its id.
   * @param id - the id of the component
   * @returns the component if found, otherwise undefined
   */
  get(id: string) {
    return this.cache.get(id);
  }
}