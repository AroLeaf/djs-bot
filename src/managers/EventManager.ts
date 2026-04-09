import { Collection, type Client, type ClientEvents } from 'discord.js';
import type { Event, EventKey } from '../events';
import * as defaultEvents from '../events/builtin';

export interface EventManagerOptions {
  events: Iterable<Event<EventKey>>;
  builtins?: boolean;
}

export class EventManager {
  client: Client;
  events: Collection<EventKey, Event<EventKey>[]> = new Collection();

  constructor(client: Client, options: EventManagerOptions) {
    this.client = client;
    if (options.builtins ?? true) for (const event of defaultEvents.ALL) this.add(event);
    if (options.events) for (const event of options.events) this.add(event);
  }

  #getListener(key: EventKey) {
    return (...args: ClientEvents[EventKey]) => {
      const events = this.events.get(key);
      if (!events?.length) return;
      for (const event of events) event.handler(...args);
      this.events.set(key, events.filter(event => !event.once));
    }
  }

  add(event: Event<EventKey>): this {
    if (!this.events.has(event.event)) {
      this.client.on(event.event, this.#getListener(event.event));
      this.events.set(event.event, []);
    }
    this.events.get(event.event)?.push(event);
    return this;
  }
}