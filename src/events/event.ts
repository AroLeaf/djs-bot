import { Client } from 'discord.js';
import { EventOptions } from '../types';


/**
 * A class for handling events.
 */
export class Event {
  /** The name of this event. */
  name?: string;
  /** The event to listen for. */
  event: string;
  /** Whether this event should be repeated. (default: true) */
  repeat: boolean;
  /** The function to run when this event is emitted. */
  run: Function;

  /**
   * Creates a new event.
   * @param data - the data for this event
   * @param run - the function to run when this event is emitted
   */
  constructor(data: EventOptions, run: Function) {
    this.name = data.name;
    this.event = data.event;
    this.repeat = data.repeat ?? true;
    this.run = run;
  }

  /**
   * Initializes this event, connecting it to a client.
   * @param client - the client to listen for this event on
   */
  init(client: Client) {
    this.repeat
      ? client.on(this.event, (...args) => this.run(...args))
      : client.once(this.event, (...args) => this.run(...args));
  }
}