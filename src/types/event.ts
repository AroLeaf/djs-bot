import { ClientEvents } from 'discord.js';

export type EventKey = keyof ClientEvents;
export type EventHandler<K extends EventKey> = (...args: ClientEvents[K]) => any;

export interface EventOptions<K extends EventKey> {
  name?: string;
  event: K;
  once?: boolean;
}