import { EventHandler, EventKey, EventOptions } from '../types/event';

export default class Event<K extends EventKey> {
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
}