import type { Event, EventKey } from '../Event';
import contextCommands from './contextCommands';
import registrar from './registrar';
import slashCommands from './slashCommands';


export const ALL = <Event<EventKey>[]>[
  registrar,
  slashCommands,
  contextCommands,
];

export const HANDLERS = <Event<EventKey>[]>[
  slashCommands,
  contextCommands,
];

export {
  registrar,
  slashCommands,
  contextCommands,
}