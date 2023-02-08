import { Client } from 'discord.js';
import { Event } from './event.js';

/**
 * A class for managing event handlers.
 */
export class EventManager {
  /** The client that instantiated this event manager. */
  client: Client;
  /** The events that this event manager manages. */
  cache: Event[];

  /**
   * Creates a new event manager.
   * @param client - the client instantiating this event manager
   * @param events - the events that this event manager should manage
   */
  constructor(client: Client, events: Event[] = []) {
    this.client = client;
    this.cache = events;
    for (const event of events) {
      event.init(client);
    }
  }
}