import { Collection, ComponentType } from 'discord.js';
import { ActionRowComponentData, ComponentData, ManagedComponentOptions } from './types';
import * as util from './util';

export class ComponentsManager {
  cache: Collection<string, ActionRowComponentData<true>>;

  constructor() {
    this.cache = new Collection();
  }

  #generateId() {
    let id;
    do {
      id = Math.random().toString(36).slice(2, 8);
    } while (this.cache.has(id));
    return id;
  }

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

  get(id: string) {
    return this.cache.get(id);
  }
}