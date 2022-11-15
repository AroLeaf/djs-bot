import { Client } from 'discord.js';
import { Event } from './event.js';

export class EventManager {
  client: Client;
  cache: Event[];

  constructor(client: Client, events: Event[] = []) {
    this.client = client;
    this.cache = events;
    for (const event of events) {
      event.init(client);
    }
  }
}