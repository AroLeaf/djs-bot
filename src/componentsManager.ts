import { ActionRowData, Client, Collection, ComponentData, ComponentType, MessageActionRowComponentData } from 'discord.js';
import { ComponentHandler, ComponentOptions } from './types/components';
import { objectOmit } from './util';

export default class ComponentsManager {
  cache: Collection<string, ComponentHandler>;
  client: Client;
  
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

  create(data: ComponentOptions): MessageActionRowComponentData;
  create(data: ComponentOptions[]): ActionRowData<MessageActionRowComponentData>;
  create(data: ComponentOptions | ComponentOptions[]) {
    if (Array.isArray(data)) return {
      type: ComponentType.ActionRow,
      components: <any>data.map(d => this.create(d)),
    }
    
    if (!('customId' in data) || !data.run) return data;
    data.customId ||= this.#generateId();
    this.cache.set(data.customId, data.run);
    return <ComponentData>objectOmit(data, 'run');
  }

  get(id: string) {
    return this.cache.get(id);
  }
}