import { Client } from 'discord.js';

import { Event } from './event.js';
import { partition } from '../util.js';

export class EventManager {
  client: Client;
  cache: Event[];

  constructor(client: Client, events: Event[] = []) {
    this.client = client;
    this.cache = events;
    const [rest, def] = partition(events, e => !e._default);
    for (const event of rest.concat(def)) {
      event.init(client);
    }
  }
}