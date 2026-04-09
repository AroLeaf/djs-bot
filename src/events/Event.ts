import type { ClientEvents } from 'discord.js';

export type EventKey = keyof ClientEvents;
export type EventHandler<K extends EventKey> = (...args: ClientEvents[K]) => any;

export interface EventOptions<K extends EventKey> {
  name?: string;
  event: K;
  once?: boolean;
}

export class Event<K extends EventKey> {
  name?: string;
  event: K;
  once?: boolean;
  handler: EventHandler<K>;
  
  constructor(options: EventOptions<K>, handler: EventHandler<K>) {
    this.name = options.name;
    this.event = options.event;
    this.once = options.once ?? false;
    this.handler = handler;
  }

  get id(): string {
    return this.name ? `${this.event}:${this.name}` : this.event;
  }
}