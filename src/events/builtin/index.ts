import type { Event, EventKey } from '../Event';
import registrar from './registrar';
import slashCommands from './slashCommands';

export const ALL = <Event<EventKey>[]>[
  registrar,
  slashCommands,
];

export const HANDLERS = <Event<EventKey>[]>[
  slashCommands,
];

export {
  registrar,
  slashCommands,
}