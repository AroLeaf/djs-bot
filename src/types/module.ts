import { Command } from '../commands';
import { Event } from '../events';
import { BotHookArguments } from './bot';
import { EventKey } from './event';

export type NestedArray<T> = (T | NestedArray<T>)[];

export interface ModuleHookOptions<T extends EventKey> {
  events: T[];
  run(...args: BotHookArguments[T]): Promise<boolean | undefined>;
}

export interface ModuleOptions {
  events?: NestedArray<Event<EventKey>>;
  commands?: NestedArray<Command>;
  hooks?: NestedArray<ModuleHookOptions<EventKey>>;
}