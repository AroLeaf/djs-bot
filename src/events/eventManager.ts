import { Client, ClientEvents, Collection } from 'discord.js';
import { BotHookArguments, BotHookKey } from '../types/bot';
import { EventKey } from '../types/event';
import Event from './event';

export default class EventManager {
  client: Client;
  events: Collection<EventKey, Event<EventKey>[]>;

  constructor(client: Client, events: Event<EventKey>[] = []) {
    this.client = client;
    this.events = new Collection();
    for (const event of events) this.add(event);
  }

  #getListener(eventkey: EventKey) {
    return async (...args: ClientEvents[EventKey]) => {
      const events = this.events.get(eventkey);
      const ok = await this.runHooks(eventkey, ...args);
      if (!events?.length || ok === false) return;
      for (const event of events) {
        event.handler(...args);
        if (event.once) events.splice(events.indexOf(event), 1);
      }
    }
  }

  async runHooks<K extends BotHookKey>(eventkey: K, ...args: BotHookArguments[K]): Promise<boolean | void> {
    const hooks = this.client.hooks?.[eventkey];
    if (!hooks) return;
    for (const hook of hooks) {
      const ok = await hook(...args);
      if (ok === false) return false;
    }
  }

  add(event: Event<EventKey>) {
    if (!this.events.has(event.event)) {
      this.client.on(event.event, this.#getListener(event.event));
      this.events.set(event.event, []);
    }
    this.events.get(event.event)!.push(event);
  }
}